import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { FlightSearchFormData } from "@/lib/schema/flight-search";
import { FlightSearchLoadingSkeleton } from "@/components/FlightSearchLoadingSkeleton";
import { getFlightSearchQuery } from "@/lib/queries/flight-search";
import { SearchResults } from "./search-results";
import { SearchPageProps } from "@/types/flight-search";

export default async function SearchPage({ searchParams }: SearchPageProps) {
	// ✅ AWAIT the searchParams Promise
	const params = await searchParams;

	const queryClient = new QueryClient();

	// ✅ Helper function to safely extract string values
	const getParam = (key: string): string => {
		const value = params[key];
		return Array.isArray(value) ? value[0] || "" : value || "";
	};

	// Convert search params to search data
	const searchData: FlightSearchFormData = {
		fromAirport: {
			iata: getParam("from"),
			name: "",
			city: "",
			country: "",
		},
		toAirport: {
			iata: getParam("to"),
			name: "",
			city: "",
			country: "",
		},
		departureDate: getParam("departure"),
		returnDate: getParam("return") || undefined,
		passengers: {
			adults: parseInt(getParam("adults")) || 1,
			children: parseInt(getParam("children")) || 0,
			infants: parseInt(getParam("infants")) || 0,
		},
		travelClass: (getParam("class") || "e") as "e" | "b" | "f" | "w",
		tripType: getParam("tripType") === "roundtrip" ? "roundtrip" : "oneway",
		directOnly: getParam("directOnly") === "true",
	};

	// Only prefetch if we have required data
	const canPrefetch =
		searchData.fromAirport?.iata &&
		searchData.toAirport?.iata &&
		searchData.departureDate;

	if (canPrefetch) {
		try {
			await queryClient.prefetchQuery(getFlightSearchQuery(searchData));
		} catch (error) {
			console.error("Failed to prefetch flight data:", error);
		}
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<FlightSearchLoadingSkeleton />}>
				<SearchResults searchData={searchData} />
			</Suspense>
		</HydrationBoundary>
	);
}
