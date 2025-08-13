"use client";

import React, { useState } from "react";
import { FlightRecommendation, Search } from "@/types/flight-search";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Clock, Luggage, ChevronDown, ChevronUp, Plane } from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useSearchParams } from "next/navigation";

export const FlightCard = React.memo(
	({
		flight,
		search,
		isNew = false,
	}: {
		search: Search;
		flight: FlightRecommendation;
		isNew?: boolean;
	}) => {
		const [isOpen, setIsOpen] = useState(false);
		const searchParams = useSearchParams();
		const formatDuration = (minutes: number) => {
			const hours = Math.floor(minutes / 60);
			const mins = minutes % 60;
			return `${hours}h ${mins}m`;
		};

		const formatPrice = (amount: number) => {
			return (
				new Intl.NumberFormat("en-US", {
					minimumFractionDigits: 0,
				}).format(amount) + " RUB"
			);
		};
		const calculatePassengerPrices = () => {
			const passengerCounts = {
				adults: Number(searchParams?.get("adults") || "0"),
				children: Number(searchParams?.get("children") || "0"),
				infants: Number(searchParams?.get("infants") || "0"),
			};

			// Mapping for passenger type conversion
			const typeMap = {
				adt: "adults",
				chd: "children",
				inf: "infants",
			} as const;

			// Fallback to default price if no specific passenger prices found
			const defaultPrices = {
				adults: flight.price.RUB.passengers_amounts?.adult || 0,
				children: flight.price.RUB.passengers_amounts?.child || 0,
				infants: flight.price.RUB.passengers_amounts?.infant || 0,
			};

			// Use a Map to consolidate passenger prices
			const passengerPricesMap = new Map<
				string,
				{
					type: string;
					count: number;
					price: number;
				}
			>();

			// Process passenger amounts details
			const passengerAmountsDetails =
				flight.price.RUB.agent_mode_prices?.passengers_amounts_details ||
				flight.price.RUB.passengers_amounts_details ||
				[];

			passengerAmountsDetails.forEach(detail => {
				const normalizedType = typeMap[detail.type as keyof typeof typeMap];

				if (normalizedType && passengerCounts[normalizedType] > 0) {
					const type =
						normalizedType === "adults"
							? "Adult"
							: normalizedType === "children"
							? "Child"
							: "Infant";

					const priceKey =
						detail.service_amount_for_active_agent_mode ||
						defaultPrices[normalizedType] ||
						0;

					// If the type already exists, update the price
					const existingEntry = passengerPricesMap.get(type);
					if (existingEntry) {
						passengerPricesMap.set(type, {
							type,
							count: passengerCounts[normalizedType],
							price: priceKey,
						});
					} else {
						passengerPricesMap.set(type, {
							type,
							count: passengerCounts[normalizedType],
							price: priceKey,
						});
					}
				}
			});

			// If no prices found, use default prices
			if (passengerPricesMap.size === 0) {
				if (passengerCounts.adults > 0) {
					passengerPricesMap.set("Adult", {
						type: "Adult",
						count: passengerCounts.adults,
						price: defaultPrices.adults,
					});
				}
				if (passengerCounts.children > 0) {
					passengerPricesMap.set("Child", {
						type: "Child",
						count: passengerCounts.children,
						price: defaultPrices.children,
					});
				}
			}

			// Convert Map to array
			return Array.from(passengerPricesMap.values());
		};

		const passengerPrices = calculatePassengerPrices();
		const totalPrice = passengerPrices.reduce(
			(sum, passenger) => sum + passenger.price * passenger.count,
			0
		);

		const formatDate = (dateStr: string) => {
			const [day, month, year] = dateStr.split(".");
			const date = new Date(`${year}-${month}-${day}`);
			const options: Intl.DateTimeFormatOptions = {
				day: "numeric",
				month: "short",
				weekday: "short",
			};
			return date.toLocaleDateString("en-US", options);
		};

		const calculateTransferTime = (segment1: any, segment2: any) => {
			try {
				// Parse the custom date format
				const [arrDate, arrTime] = segment1.arr.datetime.split(" ");
				const [depDate, depTime] = segment2.dep.datetime.split(" ");

				const [arrDay, arrMonth, arrYear] = arrDate.split(".");
				const [depDay, depMonth, depYear] = depDate.split(".");

				const arrivalTime = new Date(
					`${arrYear}-${arrMonth}-${arrDay}T${arrTime}`
				);
				const departureTime = new Date(
					`${depYear}-${depMonth}-${depDay}T${depTime}`
				);

				const transferMinutes = Math.floor(
					(departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60)
				);

				if (isNaN(transferMinutes)) {
					console.error("Invalid transfer time calculation", {
						arrivalTime,
						departureTime,
					});
					return "Transfer time unavailable";
				}

				return formatDuration(transferMinutes);
			} catch (error) {
				console.error("Error calculating transfer time:", error);
				return "Transfer time unavailable";
			}
		};

		const mainSegment = flight.segments[0];
		const lastSegment = flight.segments[flight.segments.length - 1];
		const depDateFormatted = formatDate(mainSegment.dep.date);
		const arrDateFormatted = formatDate(lastSegment.arr.date);

		const renderFlightRoute = () => {
			if (flight.segments_count === 1) {
				// Direct flight - single dotted line
				return (
					<div className="flex-1 flex items-center justify-between px-2 sm:px-4 pt-6">
						<div className="flex-shrink-0">
							<Plane className="text-muted-foreground h-5 w-5 transform -translate-y-4 translate-x-2" />
						</div>
						<div className="flex-1 flex flex-col items-center px-2 sm:px-4 relative">
							<div className="w-full border-t border-muted-foreground border-dashed"></div>
							<div className="text-xs text-muted-foreground text-center mt-1 whitespace-nowrap">
								{formatDuration(flight.duration)}
							</div>
							<div className="text-xs text-muted-foreground text-center whitespace-nowrap">
								Direct
							</div>
						</div>
						<div className="flex-shrink-0">
							<Plane className="text-muted-foreground rotate-90 h-5 w-5 transform -translate-y-4 -translate-x-2" />
						</div>
					</div>
				);
			} else {
				// Flights with transfers
				return (
					<div className="flex-1 flex items-center px-2 sm:px-4 min-w-0 pt-6 relative">
						{/* Starting plane icon */}
						<div className="flex-shrink-0 z-10">
							<Plane className="text-muted-foreground h-5 w-5" />
						</div>

						{/* Dotted line with transfer dots */}
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
											{calculateTransferTime(
												segment,
												flight.segments[index + 1]
											)}
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Ending plane icon */}
						<div className="flex-shrink-0 z-10">
							<Plane className="text-muted-foreground rotate-90 h-5 w-5" />
						</div>
					</div>
				);
			}
		};

		return (
			<Card
				className={`transition-all duration-300 py-0 ${
					isNew ? "animate-in slide-in-from-bottom-4 fade-in-0" : ""
				} bg-card text-card-foreground`}
			>
				<Collapsible
					open={isOpen}
					onOpenChange={setIsOpen}
					className="transition-all duration-300"
				>
					<CardHeader className="px-4">
						<div className="flex items-center justify-between gap-4 sm:gap-8 w-full min-h-[8rem]">
							<div className="flex flex-col justify-between w-full h-full gap-2 p-2">
								<div className="font-semibold text-sm sm:text-base uppercase">
									{mainSegment.carrier.title}
								</div>

								<div className="flex justify-between items-center">
									{/* Departure Info */}
									<div className="text-left flex-shrink-0">
										<div className="font-semibold text-lg">
											{mainSegment.dep.time}
										</div>
										<div className="text-sm text-muted-foreground">
											{search.segments[0].from.name},{" "}
											{mainSegment.dep.airport.code}
										</div>
										<div className="text-xs text-muted-foreground">
											{depDateFormatted}
										</div>
									</div>

									{/* Flight Route - Updated to handle transfers */}
									{renderFlightRoute()}

									{/* Arrival Info */}
									<div className="text-right flex-shrink-0">
										<div className="font-semibold text-lg">
											{lastSegment.arr.time}
										</div>
										<div className="text-sm text-muted-foreground">
											{search.segments[0].to.name},{" "}
											{lastSegment.arr.airport.code}
										</div>
										<div className="text-xs text-muted-foreground">
											{arrDateFormatted}
										</div>
									</div>
								</div>

								{/* Additional info for transfers */}
								{flight.segments_count > 1 && (
									<div className="text-center">
										<div className="text-xs text-blue-400">
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
									<Button className="w-full sm:w-auto" variant="outline">
										Select
									</Button>
									<CollapsibleTrigger asChild>
										<Button variant="ghost" size="sm" className="p-2">
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
					</CardHeader>

					<CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open] animate-collapsible-down transition-all duration-300 ease-in-out">
						<CardContent className="px-4 pt-2 bg-accent dark:bg-card rounded-b-lg shadow-sm border-t-1 border-dashed border-muted-foreground/30">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
								{/* Detailed Segments Section */}
								<div className="space-y-1">
									{flight.segments.map((segment, index) => (
										<div
											key={index}
											className="border-l-4 border-l-primary/50 dark:border-l-primary/50 border border-neutral-300 dark:border-neutral-600 dark:bg-accent rounded-r-lg px-4 py-2"
										>
											<div className="flex justify-between items-center mb-2">
												<div className="flex items-center gap-2">
													<span className="font-semibold text-sm">
														{segment.carrier.title} - Flight{" "}
														{segment.flight_number}
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
																<span className="text-white">
																	{formatDuration(
																		segment.duration?.flight?.common || 0
																	)}
																</span>
															</span>
														</div>
													</div>
												</div>
											</div>

											<div className="flex flex-col">
												<div>
													<div className="flex items-center gap-2">
														<Plane className="w-5 h-5 text-muted-foreground" />
														<div className="flex w-full gap-8 items-center">
															<div className="flex flex-col">
																<div className="font-semibold">
																	{segment.dep.time}
																</div>
																<div className="text-xs text-gray-500">
																	{formatDate(segment.dep.date)}
																</div>
															</div>
															<div className="text-sm font-medium">
																{segment.dep.city.title}
																<div className="text-gray-500">
																	{segment.dep.airport.title}, (
																	{segment.dep.airport.code})
																</div>
															</div>
														</div>
													</div>
												</div>
												<div className="w-px h-6 ml-1 bg-gray-400 dark:bg-muted-foreground hidden xl:block" />
												<div>
													<div className="flex items-center gap-2">
														<Plane className="w-5 h-5 text-muted-foreground rotate-90" />
														<div className="flex w-full gap-8 items-center">
															<div className="flex flex-col">
																<div className="font-semibold">
																	{segment.arr.time}{" "}
																</div>
																<div className="text-xs text-gray-500">
																	{formatDate(segment.arr.date)}
																</div>
															</div>
															<div className="text-sm font-medium">
																{segment.arr.city.title}
																<div className="text-gray-500">
																	{segment.arr.airport.title}, (
																	{segment.arr.airport.code})
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>

											{/* Transfer Information */}
											<div>
												{index < flight.segments.length - 1 && (
													<div className="mt-2 dark:bg-neutral-700 bg-red-100 border-l-4 border-red-500 p-2 rounded-r-lg">
														<div className="flex items-center gap-2">
															<Clock className="w-4 h-4 text-red-500 font-semibold" />
															<div className="text-xs text-muted-foreground">
																Transfer at {segment.arr.airport.code}:{" "}
																<span className="text-red-500 font-semibold">
																	{calculateTransferTime(
																		segment,
																		flight.segments[index + 1]
																	)}
																</span>
															</div>
														</div>
													</div>
												)}
											</div>
										</div>
									))}
								</div>

								{/* Pricing and Additional Details Section */}
								<div className="p-4 rounded-lg space-y-4">
									<div>
										<h3 className="text-sm font-semibold mb-2">
											Price per Passenger
										</h3>
										<div className="space-y-2">
											{passengerPrices.map((passenger, index) => (
												<div
													key={index}
													className="flex justify-between items-center border-b pb-1 last:border-b-0"
												>
													<span className="text-sm text-muted-foreground">
														{passenger.type} x {passenger.count}
													</span>
													<span className="text-sm font-medium">
														{formatPrice(passenger.price * passenger.count)}
													</span>
												</div>
											))}
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Luggage className="w-4 h-4 text-gray-500" />
										<span className="text-sm text-gray-600">
											{flight.is_baggage ? "Baggage Included" : "No Baggage"}
										</span>
									</div>

									<div className="flex gap-2">
										<Badge variant="outline">STANDARD</Badge>
										{flight.upgrades?.length > 0 && (
											<Badge
												variant="outline"
												className="bg-blue-50 text-blue-600"
											>
												Flex
											</Badge>
										)}
									</div>
								</div>
							</div>
						</CardContent>
					</CollapsibleContent>
				</Collapsible>
			</Card>
		);
	}
);
