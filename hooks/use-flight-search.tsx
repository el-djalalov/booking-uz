// components/flight-search/hooks/use-flight-search.ts
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	flightSearchSchema,
	type FlightSearchFormData,
} from "@/lib/schema/flight-search";
import { searchFlights } from "@/app/actions/actions";
import { toast } from "sonner";
import { FlightSearchState } from "@/components/flight-search/types";

export const useFlightSearch = () => {
	const [state, setState] = useState<FlightSearchState>({
		showFromSearch: false,
		showToSearch: false,
		showPassengers: false,
		showDatePicker: false,
		fromInputText: "",
		toInputText: "",
	});

	const [isPending, startTransition] = useTransition();

	const form = useForm<FlightSearchFormData>({
		resolver: zodResolver(flightSearchSchema),
		defaultValues: {
			tripType: "roundtrip",
			fromAirport: null,
			toAirport: null,
			departureDate: "",
			returnDate: undefined,
			passengers: {
				adults: 1,
				children: 0,
				infants: 0,
			},
			travelClass: "e",
			directOnly: false,
		},
	});

	const watchedValues = form.watch();

	// Update input text when airports change
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
		form.setValue("fromAirport", toAirport);
		form.setValue("toAirport", fromAirport);

		if (navigator.vibrate) {
			navigator.vibrate(50);
		}
	};

	const handleSubmit = (data: FlightSearchFormData) => {
		startTransition(async () => {
			const result = await searchFlights(data);
			if (result.error) {
				toast.error(result.error);
			} else {
				console.log(result.data);
				toast.success("Flights found!");
			}
		});
	};

	const updatePassengerCount = (
		type: "adults" | "children" | "infants",
		delta: number
	) => {
		const current = watchedValues.passengers[type];
		const min = type === "adults" ? 1 : 0;
		const max = 9;
		const newValue = Math.max(min, Math.min(max, current + delta));
		form.setValue(`passengers.${type}`, newValue);

		if (type === "infants" && newValue > watchedValues.passengers.adults) {
			toast.error("Number of infants cannot exceed number of adults");
			return;
		}
	};

	return {
		form,
		state,
		watchedValues,
		isPending,
		updateState,
		closeAllDropdowns,
		handleSwapAirports,
		handleSubmit: form.handleSubmit(handleSubmit),
		updatePassengerCount,
	};
};
