"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
	flightSearchSchema,
	type FlightSearchFormData,
} from "@/lib/schema/flight-search";
import { toast } from "sonner";
import { FlightSearchState } from "@/components/flight-search/types";
import { useFlightSearchStore } from "@/stores/flight-search-store";

const createCompleteFormData = (
	partial?: Partial<FlightSearchFormData>
): FlightSearchFormData => {
	return {
		tripType: partial?.tripType ?? "roundtrip",
		fromAirport: partial?.fromAirport ?? null,
		toAirport: partial?.toAirport ?? null,
		departureDate: partial?.departureDate ?? "",
		returnDate: partial?.returnDate,
		passengers: {
			adults: partial?.passengers?.adults ?? 1,
			children: partial?.passengers?.children ?? 0,
			infants: partial?.passengers?.infants ?? 0,
		},
		travelClass: partial?.travelClass ?? "e",
		directOnly: partial?.directOnly ?? false,
	};
};

export const useFlightSearch = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const {
		searchData,
		recentSearches,
		favoriteAirports,
		setSearchData,
		addRecentSearch,
		addFavoriteAirport,
		restoreFromUrl,
	} = useFlightSearchStore();

	// ✅ Use ref to prevent circular updates
	const isUpdatingFromStore = useRef(false);
	const isUpdatingFromForm = useRef(false);

	const [state, setState] = useState<FlightSearchState>({
		showFromSearch: false,
		showToSearch: false,
		showPassengers: false,
		showDatePicker: false,
		fromInputText: "",
		toInputText: "",
	});

	const form = useForm<FlightSearchFormData>({
		resolver: zodResolver(flightSearchSchema),
		defaultValues: createCompleteFormData(searchData),
	});

	const watchedValues = form.watch();

	// ✅ Only restore from URL on mount and URL changes
	useEffect(() => {
		const hasUrlParams =
			searchParams?.has("from") ||
			searchParams?.has("to") ||
			searchParams?.has("departure");

		if (hasUrlParams && searchParams) {
			isUpdatingFromStore.current = true;
			restoreFromUrl(searchParams).finally(() => {
				isUpdatingFromStore.current = false;
			});
		}
	}, [searchParams, restoreFromUrl]);

	// ✅ Update Zustand store when form changes (but not when updating from store)
	useEffect(() => {
		if (isUpdatingFromStore.current) return;

		const subscription = form.watch((value, { name, type }) => {
			// Only update if it's a user change, not a programmatic reset
			if (type === "change" && value && !isUpdatingFromForm.current) {
				const completeValue = createCompleteFormData(
					value as Partial<FlightSearchFormData>
				);
				setSearchData(completeValue);
			}
		});
		return () => subscription.unsubscribe();
	}, [form, setSearchData]);

	// ✅ Update form when Zustand store changes (but not when updating from form)
	useEffect(() => {
		if (isUpdatingFromForm.current) return;

		const completeData = createCompleteFormData(searchData);

		// ✅ Only reset if data actually changed
		const currentFormData = form.getValues();
		const hasChanged =
			JSON.stringify(currentFormData) !== JSON.stringify(completeData);

		if (hasChanged) {
			isUpdatingFromStore.current = true;
			form.reset(completeData);
			// Small delay to ensure form update completes
			setTimeout(() => {
				isUpdatingFromStore.current = false;
			}, 0);
		}
	}, [searchData, form]);

	// ✅ Update input display text
	useEffect(() => {
		if (watchedValues.fromAirport) {
			setState(prev => ({
				...prev,
				fromInputText: `${watchedValues.fromAirport!.iata} - ${
					watchedValues.fromAirport!.name
				}`,
			}));
		} else {
			setState(prev => ({ ...prev, fromInputText: "" }));
		}
	}, [watchedValues.fromAirport]);

	useEffect(() => {
		if (watchedValues.toAirport) {
			setState(prev => ({
				...prev,
				toInputText: `${watchedValues.toAirport!.iata} - ${
					watchedValues.toAirport!.name
				}`,
			}));
		} else {
			setState(prev => ({ ...prev, toInputText: "" }));
		}
	}, [watchedValues.toAirport]);

	const updateState = (updates: Partial<FlightSearchState>) => {
		setState(prev => ({ ...prev, ...updates }));
	};

	const closeAllDropdowns = () => {
		setState(prev => ({
			...prev,
			showFromSearch: false,
			showToSearch: false,
			showPassengers: false,
			showDatePicker: false,
		}));
	};

	const handleSwapAirports = () => {
		const fromAirport = watchedValues.fromAirport;
		const toAirport = watchedValues.toAirport;

		// ✅ Prevent circular updates during swap
		isUpdatingFromForm.current = true;
		form.setValue("fromAirport", toAirport);
		form.setValue("toAirport", fromAirport);

		setTimeout(() => {
			isUpdatingFromForm.current = false;
		}, 0);

		if (navigator.vibrate) {
			navigator.vibrate(50);
		}
	};

	const handleSubmit = (data: FlightSearchFormData) => {
		// Add to recent searches
		addRecentSearch(data);

		// Add airports to favorites
		if (data.fromAirport) {
			addFavoriteAirport(data.fromAirport);
		}
		if (data.toAirport) {
			addFavoriteAirport(data.toAirport);
		}

		// Generate URL with all parameters
		const searchParams = new URLSearchParams({
			from: data.fromAirport?.iata || "",
			to: data.toAirport?.iata || "",
			departure: data.departureDate,
			...(data.fromAirport?.name && { fromName: data.fromAirport.name }),
			...(data.fromAirport?.city && { fromCity: data.fromAirport.city }),
			...(data.fromAirport?.country && {
				fromCountry: data.fromAirport.country,
			}),
			...(data.toAirport?.name && { toName: data.toAirport.name }),
			...(data.toAirport?.city && { toCity: data.toAirport.city }),
			...(data.toAirport?.country && { toCountry: data.toAirport.country }),
			...(data.returnDate && { return: data.returnDate }),
			adults: data.passengers.adults.toString(),
			children: data.passengers.children.toString(),
			infants: data.passengers.infants.toString(),
			class: data.travelClass,
			tripType: data.tripType,
			directOnly: data.directOnly.toString(),
		});

		router.push(`/search?${searchParams.toString()}`);
	};

	const updatePassengerCount = (
		type: "adults" | "children" | "infants",
		delta: number
	) => {
		const current = form.getValues("passengers");
		const min = type === "adults" ? 1 : 0;
		const max = 9;

		let next = Math.max(min, Math.min(max, (current?.[type] ?? 0) + delta));

		if (type === "infants" && next > current.adults) {
			toast.error("Number of infants cannot exceed number of adults");
			return;
		}

		// ✅ Prevent circular updates during passenger count change
		isUpdatingFromForm.current = true;
		form.setValue(
			"passengers",
			{ ...current, [type]: next },
			{ shouldDirty: true, shouldTouch: true, shouldValidate: false }
		);

		setTimeout(() => {
			isUpdatingFromForm.current = false;
		}, 0);
	};

	return {
		form,
		state,
		watchedValues,
		updateState,
		closeAllDropdowns,
		handleSwapAirports,
		handleSubmit: form.handleSubmit(handleSubmit),
		updatePassengerCount,
		recentSearches,
		favoriteAirports,
	};
};
