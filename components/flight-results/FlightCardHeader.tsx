import { FlightRecommendation, Search } from "@/types/flight-search";
import { ChevronDown, ChevronUp, Plane } from "lucide-react";
import React, { useCallback } from "react";
import { formatDate, formatDuration, formatPrice } from "./utils";
import { Button } from "../ui/button";
import { CollapsibleTrigger } from "../ui/collapsible";
import useTransferTime from "@/hooks/use-calculate-transfer-time";

interface FlightCardHeaderProps {
	flight: FlightRecommendation;
	search: Search;
	isOpen: boolean;
}

const FlightCardHeader: React.FC<FlightCardHeaderProps> = ({
	flight,
	search,
	isOpen,
}) => {
	const mainSegment = flight.segments[0];
	const lastSegment = flight.segments[flight.segments.length - 1];
	const depDateFormatted = formatDate(mainSegment.dep.date);
	const arrDateFormatted = formatDate(lastSegment.arr.date);

	const renderFlightRoute = useCallback(() => {
		if (flight.segments_count === 1) {
			return (
				<div className="flex-1 flex items-center justify-between px-2 sm:px-4 pt-6 ">
					{/* Direct flight */}
					<Plane className="text-muted-foreground h-5 w-5 transform -translate-y-4 translate-x-2" />
					<div className="flex-1 flex flex-col items-center px-2">
						<div className="w-full border-t border-muted-foreground border-dashed"></div>
						<div className="text-xs text-muted-foreground text-center mt-1 whitespace-nowrap">
							{formatDuration(flight.duration)}
						</div>
						<div className="text-xs text-muted-foreground text-center whitespace-nowrap">
							Direct
						</div>
					</div>
					<Plane className="text-muted-foreground rotate-90 h-5 w-5 transform -translate-y-4 -translate-x-2" />
				</div>
			);
		} else {
			/* Flights with transfers */
			return (
				<div className="flex-1 flex items-center px-5 min-w-0 pt-6 relative">
					<Plane className="text-muted-foreground h-5 w-5" />
					<div className="flex-1 relative h-6">
						<div className="absolute top-1/2 left-0 right-0 border-t border-muted-foreground border-dashed"></div>

						{flight.segments.slice(0, -1).map((segment, index) => (
							<div
								key={index}
								className="absolute top-1/2 transform -translate-y-1/2 bg-white border-2 border-blue-400 rounded-full w-4 h-4 flex items-center justify-center"
								style={{
									left: `${((index + 1) / flight.segments.length) * 100}%`,
								}}
							>
								<div className="absolute -top-9 left-1/2 transform -translate-x-1/2 text-center w-24">
									<div className="text-[11px] text-muted-foreground">
										{segment.arr.city.title}
									</div>
									<div className="text-[10px] text-muted-foreground">
										{useTransferTime(segment, flight.segments[index + 1])}
									</div>
								</div>
							</div>
						))}
					</div>
					<Plane className="text-muted-foreground rotate-90 h-5 w-5" />
				</div>
			);
		}
	}, [flight.segments]);

	return (
		<div className="flex items-center justify-between gap-4 sm:gap-8 w-full min-h-[8rem]">
			<div className="flex flex-col justify-between w-full h-full gap-2 p-2">
				<div className="font-semibold text-sm sm:text-base uppercase">
					{mainSegment.carrier.title}
				</div>
				<div className="flex justify-between items-center">
					{/* Departure Info */}
					<div className="text-left flex-shrink-0">
						<div className="font-semibold text-lg">{mainSegment.dep.time}</div>
						<div className="text-sm text-muted-foreground">
							{search.segments[0].from.name}, {mainSegment.dep.airport.code}
						</div>
						<div className="text-xs text-muted-foreground">
							{depDateFormatted}
						</div>
					</div>

					{renderFlightRoute()}

					{/* Arrival Info */}
					<div className="text-right flex-shrink-0">
						<div className="font-semibold text-lg">{lastSegment.arr.time}</div>
						<div className="text-sm text-muted-foreground">
							{search.segments[0].to.name}, {lastSegment.arr.airport.code}
						</div>
						<div className="text-xs text-muted-foreground">
							{arrDateFormatted}
						</div>
					</div>
				</div>

				{/* Additional info for transfers */}
				{flight.segments_count > 1 && (
					<div className="text-center">
						<div className="text-xs text-blue-500">
							Total: {formatDuration(flight.duration)} •{" "}
							{flight.segments_count - 1} stop(s)
						</div>
					</div>
				)}
			</div>

			<div className="flex flex-col items-center justify-between gap-2 w-36 h-full">
				<span className="text-[22px] pt-2 font-bold text-primary text-center whitespace-nowrap">
					{formatPrice(flight.price.RUB.amount)}
				</span>
				<div className="flex flex-col items-center gap-2">
					<Button
						className="w-full dark:text-white cursor-pointer"
						size="sm"
						variant="default"
					>
						Select
					</Button>
					<CollapsibleTrigger asChild>
						<Button variant="outline" size="sm" className="p-2 cursor-pointer">
							Details
							{isOpen ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
						</Button>
					</CollapsibleTrigger>
				</div>
			</div>
		</div>
	);
};

export default FlightCardHeader;
