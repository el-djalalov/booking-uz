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
	const queryClient = new QueryClient();

	// Convert search params to search data
	const searchData: FlightSearchFormData = {
		fromAirport: {
			iata: searchParams.from,
			name: "",
			city: "",
			country: "",
		},
		toAirport: {
			iata: searchParams.to,
			name: "",
			city: "",
			country: "",
		},
		departureDate: searchParams.departure,
		returnDate: searchParams.return,
		passengers: {
			adults: parseInt(searchParams.adults) || 1,
			children: parseInt(searchParams.children) || 0,
			infants: parseInt(searchParams.infants) || 0,
		},
		travelClass: (searchParams.class || "e") as "e" | "b" | "f" | "w",
		tripType: searchParams.tripType === "roundtrip" ? "roundtrip" : "oneway",
		directOnly: searchParams.directOnly === "true",
	};

	try {
		await queryClient.prefetchQuery(getFlightSearchQuery(searchData));
	} catch (error) {
		console.error("Failed to prefetch flight data:", error);
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<FlightSearchLoadingSkeleton />}>
				<SearchResults searchData={searchData} />
			</Suspense>
		</HydrationBoundary>
	);
}
