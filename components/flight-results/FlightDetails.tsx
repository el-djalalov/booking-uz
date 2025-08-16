import { FlightRecommendation } from "@/types/flight-search";
import { Clock, Plane } from "lucide-react";
import React from "react";
import { formatDate, formatDuration } from "./utils";
import useTransferTime from "@/hooks/use-calculate-transfer-time";

interface FlightDetailsProps {
	flight: FlightRecommendation;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ flight }) => {
	return (
		<div className="space-y-2 w-[60%]">
			{flight.segments.map((segment, index) => {
				return (
					<div
						key={index}
						className="border-l-4 border-l-primary/50 dark:border-l-primary/50 border border-neutral-300 dark:border-blue-500/20 dark:bg-blue-950/20 rounded-r-lg px-4 py-2 shadow-md"
					>
						<div className="flex justify-between items-center mb-2">
							<div className="flex items-center gap-2">
								<span className="font-semibold text-sm">
									{segment.carrier.title} - Flight {segment.flight_number}
								</span>
							</div>
							<div className="text-right float-right">
								<div className="text-xs text-muted-foreground">
									{segment.aircraft.title}
								</div>
								<div className="flex items-center justify-end">
									<div className="flex items-center gap-2">
										<Clock className="w-4 h-4 text-muted-foreground" />
										<span className="text-xs text-muted-foreground">
											Flight time:{" "}
											<span className="dark:text-white font-semibold">
												{formatDuration(segment.duration?.flight?.common || 0)}
											</span>
										</span>
									</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col">
							{/* Departure and Arrival Info */}
							<div>
								<div className="flex items-center gap-2">
									<Plane className="w-5 h-5 text-muted-foreground" />
									<div className="flex w-full gap-8 items-center">
										<div className="flex flex-col">
											<div className="font-semibold">{segment.dep.time}</div>
											<div className="text-xs text-gray-500">
												{formatDate(segment.dep.date)}
											</div>
										</div>
										<div className="text-sm font-medium">
											{segment.dep.city.title}
											<div className="text-gray-500">
												{segment.dep.airport.title}, ({segment.dep.airport.code}
												)
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="w-px h-6 ml-1 bg-gray-400 dark:bg-muted-foreground hidden xl:block" />

							<div className="flex items-center gap-2">
								<Plane className="w-5 h-5 text-muted-foreground rotate-90" />
								<div className="flex w-full gap-8 items-center">
									<div className="flex flex-col">
										<div className="font-semibold">{segment.arr.time}</div>
										<div className="text-xs text-gray-500">
											{formatDate(segment.arr.date)}
										</div>
									</div>
									<div className="text-sm font-medium">
										{segment.arr.city.title}
										<div className="text-gray-500">
											{segment.arr.airport.title}, ({segment.arr.airport.code})
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Transfer Information */}
						{index < flight.segments.length - 1 && (
							<div className="mt-2 dark:bg-blue-900/20 bg-red-100 border-l-4 border-red-500 p-2 rounded-r-lg">
								<div className="flex items-center gap-2">
									<Clock className="w-4 h-4 text-red-500 font-semibold" />
									<div className="text-xs dark:text-muted-foreground">
										Transfer at {segment.arr.airport.code}:{" "}
										<span className="dark:text-white font-semibold">
											{useTransferTime(segment, flight.segments[index + 1])}
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default FlightDetails;
