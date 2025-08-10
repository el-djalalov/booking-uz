"use client";

import { useQuery } from "@tanstack/react-query";
import { getFlightSearchQuery } from "@/lib/queries/flight-search";
import { FlightSearchFormData } from "@/lib/schema/flight-search";

import { Badge } from "@/components/ui/badge";
import { FlightSearchLoadingSkeleton } from "@/components/FlightSearchLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { ProgressiveFlightResults } from "@/components/ProgessiveFlightResults";
import { SearchSummary } from "./SearchSummary";

interface SearchResultsProps {
	searchData: FlightSearchFormData;
}

export function SearchResults({ searchData }: SearchResultsProps) {
	const { data, isLoading, isError, error, refetch } = useQuery(
		getFlightSearchQuery(searchData)
	);

	if (isLoading) {
		return <FlightSearchLoadingSkeleton />;
	}

	if (isError) {
		return (
			<div className="container mx-auto p-8">
				<div className="text-center py-12">
					<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
						<h2 className="text-lg font-semibold text-red-800 mb-2">
							❌ Search Error
						</h2>
						<p className="text-red-600 mb-4">{error?.message}</p>
						<Button onClick={() => refetch()}>Try Again</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!data?.data?.flights?.length) {
		return (
			<div className="container mx-auto p-8 text-center">
				<h2 className="text-xl font-semibold mb-4">No flights found</h2>
				<p className="text-gray-600">Try adjusting your search criteria</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-8">
			<SearchSummary searchData={searchData} />

			{/* Results Header - Fix the count display */}
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-semibold">
					{data?.data?.flights?.length || 0} flight
					{(data?.data?.flights?.length || 0) !== 1 ? "s" : ""} found
				</h2>
				<div className="flex gap-2">
					<Badge variant="secondary" className="px-2">
						Best Price First
					</Badge>
				</div>
			</div>

			<ProgressiveFlightResults
				flights={data.data.flights}
				chunkSize={6}
				renderDelay={150}
				autoLoad={true}
				showProgress={true}
			/>
		</div>
	);
}
