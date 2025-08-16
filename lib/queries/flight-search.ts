import { FlightSearchFormData } from "@/lib/schema/flight-search";
import { FlightSearchSuccessResponse } from "@/types/flight-search";

export const searchFlights = async (
	data: FlightSearchFormData
): Promise<FlightSearchSuccessResponse> => {
	const response = await fetch("/api/flights-search", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Flight search failed");
	}

	return response.json();
};

export const getFlightSearchQuery = (searchData: FlightSearchFormData) => ({
	queryKey: ["flight-search", searchData],
	queryFn: () => searchFlights(searchData),
	staleTime: 1000 * 60 * 2, // 2 minutes for flight data
	gcTime: 1000 * 60 * 10, // 10 minutes in cache
	retry: 2, // retry twice on failure
	retryDelay: 1000, // 1 second between retries
});
