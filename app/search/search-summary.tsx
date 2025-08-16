import { Card, CardContent } from "@/components/ui/card";
import { Plane, Users } from "lucide-react";
import { FlightSearchFormData } from "@/lib/schema/flight-search";

interface SearchSummaryProps {
	searchData: FlightSearchFormData;
}

function SearchSummary({ searchData }: SearchSummaryProps) {
	return (
		<div className="mb-8">
			<h1 className="text-3xl font-bold mb-4">Flight Results</h1>

			<Card>
				<CardContent className="px-4 py-0">
					<div className="flex items-center justify-between flex-wrap gap-4">
						<div className="flex items-center gap-6">
							<div className="text-center">
								<div className="font-semibold">
									{searchData.fromAirport?.iata}
								</div>
								<div className="text-sm text-gray-400">From</div>
							</div>

							{/* 	<div className="flex items-center gap-2">
								<Plane className="w-4 h-4 text-gray-400" />
								<span className="text-sm text-gray-400">
									{searchData.tripType === "roundtrip"
										? "Round trip"
										: "One way"}
								</span>
							</div> */}

							<div className="text-center">
								<div className="font-semibold">
									{searchData.toAirport?.iata}
								</div>
								<div className="text-sm text-gray-400">To</div>
							</div>
						</div>

						<div className="flex items-center gap-4 text-sm text-gray-400">
							<div className="flex items-center gap-1">
								<Users className="w-4 h-4" />
								{searchData.passengers.adults} adult(s)
								{searchData.passengers.children > 0 &&
									`, ${searchData.passengers.children} child(ren)`}
								{searchData.passengers.infants > 0 &&
									`, ${searchData.passengers.infants} infant(s)`}
							</div>
							<div>Departure: {searchData.departureDate}</div>
							{searchData.returnDate && (
								<div>Return: {searchData.returnDate}</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export { SearchSummary };
