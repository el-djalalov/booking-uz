"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
	flightSearchSchema,
	type FlightSearchFormData,
} from "@/lib/schema/flight-search";
import { toast } from "sonner";
import { FlightSearchState } from "@/components/flight-search/types";
import {
	ApiSearchResponse,
	FlightRecommendation,
	FlightSearchSuccessResponse,
} from "@/types/flight-search";

async function searchFlights(
	data: FlightSearchFormData
): Promise<FlightSearchSuccessResponse> {
	const response = await fetch("/api/flights-search", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	const result: ApiSearchResponse = await response.json();

	if (!result.success) {
		const error = new Error(result.error) as any;
		error.errorCode = result.errorCode;
		error.canRetry = result.canRetry;
		error.retryDelay = result.retryDelay;
		error.action = result.action;
		error.severity = result.severity;
		error.pid = result.pid;
		throw error;
	}

	return result;
}

export const useFlightSearch = () => {
	const router = useRouter();

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

	const searchMutation = useMutation({
		mutationFn: searchFlights,
		retry: (failureCount, error: any) => {
			if (error?.canRetry === false) return false;
			return failureCount < 3;
		},
		retryDelay: (attemptIndex, error: any) => {
			return error?.retryDelay || Math.min(1000 * 2 ** attemptIndex, 30000);
		},
		onSuccess: (result, variables) => {
			const searchParams = new URLSearchParams({
				from: variables.fromAirport?.iata || "",
				to: variables.toAirport?.iata || "",
				departure: variables.departureDate,
				...(variables.returnDate && { return: variables.returnDate }),
				adults: variables.passengers.adults.toString(),
				children: variables.passengers.children.toString(),
				infants: variables.passengers.infants.toString(),
				class: variables.travelClass,
				tripType: variables.tripType,
				directOnly: (variables.directOnly ?? false).toString(),
			});

			router.push(`/search?${searchParams.toString()}`);
		},
		onError: (error: any) => {
			console.error("❌ Flight search error:", error);
			toast.error(
				error.message || "An unexpected error occurred. Please try again."
			);
		},
	});

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
		searchMutation.mutate(data);
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

		form.setValue(
			"passengers",
			{ ...current, [type]: next },
			{ shouldDirty: true, shouldTouch: true, shouldValidate: false }
		);
	};

	return {
		form,
		state,
		watchedValues,
		isPending: searchMutation.isPending,
		error: searchMutation.error,
		isSuccess: searchMutation.isSuccess,
		reset: searchMutation.reset,
		updateState,
		closeAllDropdowns,
		handleSwapAirports,
		handleSubmit: form.handleSubmit(handleSubmit),
		updatePassengerCount,
		flights: searchMutation.data?.data?.flights as
			| FlightRecommendation[]
			| undefined,
		searchResults: searchMutation.data as
			| FlightSearchSuccessResponse
			| undefined,
		flightCount: searchMutation.data?.count || 0,
	};
};
