"use server";

import { z } from "zod";
import { apiServerClient } from "@/lib/api-server-client";
import { flightSearchSchema } from "@/lib/schema/flight-search";
import { FlightRecommendation } from "@/types/flight-search";
import { format } from "date-fns";

export async function searchRecommendations(
	values: z.infer<typeof flightSearchSchema>
) {
	const validatedFields = flightSearchSchema.safeParse(values);

	if (!validatedFields.success) {
		return { error: "Invalid search query" };
	}

	const {
		fromAirport,
		toAirport,
		departureDate,
		returnDate,
		tripType,
		...rest
	} = validatedFields.data;

	if (!fromAirport || !toAirport) {
		return { error: "Departure and destination airports are required" };
	}

	const segments = [
		{
			from: fromAirport.iata,
			to: toAirport.iata,
			date: format(new Date(departureDate), "dd.MM.yyyy"),
		},
	];

	if (tripType === "roundtrip" && returnDate) {
		segments.push({
			from: toAirport.iata,
			to: fromAirport.iata,
			date: format(new Date(returnDate), "dd.MM.yyyy"),
		});
	}

	try {
		const response = await apiServerClient.get<FlightRecommendation[]>(
			"/avia/search-recommendations",
			{
				...rest,
				segments,
			}
		);

		if (response.success) {
			return { data: response.data };
		} else {
			return { error: response.message || "Failed to fetch flights" };
		}
	} catch (error) {
		console.error("Flight search error:", error);
		return { error: "An unexpected error occurred" };
	}
}
