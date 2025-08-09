/* "use client";

import { useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { FlightRecommendation } from "@/types/flight-search";

interface VirtualizedFlightListProps {
	flights: FlightRecommendation[];
	height?: number;
	itemHeight?: number;
}

export function VirtualizedFlightList({
	flights,
	height = 600,
	itemHeight = 200,
}: VirtualizedFlightListProps) {
	// Memoize item data to prevent unnecessary re-renders
	const itemData = useMemo(() => ({ flights }), [flights]);

	return (
		<div className="w-full border rounded-lg overflow-hidden">
			<List
				height={height}
				itemCount={flights.length}
				itemSize={itemHeight}
				itemData={itemData}
				itemKey={(index, data) => data.flights[index].id || index}
			>
				{VirtualizedFlightItem}
			</List>
		</div>
	);
}

// Virtualized item component
const VirtualizedFlightItem = ({ index, style, data }: any) => {
	const flight = data.flights[index];

	return (
		<div style={style} className="p-2">
			<div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<div className="flex items-center space-x-4 mb-2">
							<span className="font-semibold text-lg">
								{flight.segments?.[0]?.from} → {flight.segments?.[0]?.to}
							</span>
							<span className="text-sm text-gray-500">
								{flight.segments?.[0]?.airline}
							</span>
						</div>

						<div className="flex items-center space-x-6 text-sm text-gray-600">
							<div>
								<span className="font-medium">Departure:</span>{" "}
								{flight.segments?.[0]?.departure_time}
							</div>
							<div>
								<span className="font-medium">Arrival:</span>{" "}
								{flight.segments?.[0]?.arrival_time}
							</div>
							<div>
								<span className="font-medium">Duration:</span>{" "}
								{flight.segments?.[0]?.duration}
							</div>
						</div>
					</div>

					<div className="text-right">
						<div className="text-2xl font-bold text-green-600">
							{flight.price?.amount} {flight.price?.currency}
						</div>
						<button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
							Select
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
 */
