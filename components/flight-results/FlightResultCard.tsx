"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
	FlightRecommendation,
	FlightSearchSuccessResponse,
	FlightSegment,
} from "@/types/flight-search";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Clock,
	Luggage,
	ChevronDown,
	ChevronUp,
	Plane,
	Repeat,
	Undo2,
	Handbag,
	Printer,
	Info,
} from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSearchParams } from "next/navigation";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

export const FlightCard = React.memo(
	({
		isNew = false,
		apiData,
		flight,
	}: {
		//		search: Search;
		flight: FlightRecommendation;
		isNew?: boolean;
		apiData: FlightSearchSuccessResponse;
	}) => {
		const [isOpen, setIsOpen] = useState(false);
		const [isModalOpen, setIsModalOpen] = useState(false);
		const searchParams = useSearchParams();
		const fareFamilyName = flight.fare_family_type?.toUpperCase() || "STANDARD";
		const search = apiData.data.search;
		const fareFamilyDetails = {
			name: fareFamilyName,
			price: flight.price.RUB.amount,
			checkedBaggage: flight.segments[0].baggage
				? `${flight.segments[0].baggage.piece || 1} piece, ${
						flight.segments[0].baggage.weight || "N/A"
				  } ${flight.segments[0].baggage.weight_unit || ""}`
				: "No checked baggage",
			handBaggage: {
				piece: flight.segments[0].cbaggage?.piece || 1,
				weight: flight.segments[0].cbaggage?.weight || 8,
				weightUnit: flight.segments[0].cbaggage?.weight_unit || "KG",
			},
			refund: flight.is_refund
				? flight.segments[0].refundBlock?.beforeDeparture?.available
					? flight.segments[0].refundBlock.beforeDeparture.isFree
						? "Free refunds"
						: "Refundable with fee"
					: "Non-refundable"
				: "Non-refundable",
			change: flight.is_change
				? flight.segments[0].exchangeBlock?.beforeDeparture?.available
					? flight.segments[0].exchangeBlock.beforeDeparture.isFree
						? "Free changes"
						: "Changeable with fee"
					: "Non-changeable"
				: "Non-changeable",
		};
		const formatDuration = (minutes: number) => {
			const hours = Math.floor(minutes / 60);
			const mins = minutes % 60;
			return `${hours}h ${mins}m`;
		};

		const formatPrice = (amount: number) =>
			new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(
				amount
			) + " RUB";

		const passengerPrices = useMemo(() => {
			const passengerCounts = {
				adults: Number(searchParams?.get("adults") || "0"),
				children: Number(searchParams?.get("children") || "0"),
				infants: Number(searchParams?.get("infants") || "0"),
			};

			const typeMap = {
				adt: "adults",
				chd: "children",
				inf: "infants",
			} as const;

			const defaultPrices = {
				adults: flight.price.RUB.passengers_amounts?.adult || 0,
				children: flight.price.RUB.passengers_amounts?.child || 0,
				infants: flight.price.RUB.passengers_amounts?.infant || 0,
			};

			const passengerPricesMap = new Map<
				string,
				{ type: string; count: number; price: number }
			>();

			const passengerAmountsDetails =
				flight.price.RUB.agent_mode_prices?.passengers_amounts_details ||
				flight.price.RUB.passengers_amounts_details ||
				[];

			passengerAmountsDetails.forEach(detail => {
				const normalizedType = typeMap[detail.type as keyof typeof typeMap];
				if (normalizedType && passengerCounts[normalizedType] > 0) {
					const type =
						normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);
					const priceKey =
						detail.service_amount_for_active_agent_mode ||
						defaultPrices[normalizedType] ||
						0;

					passengerPricesMap.set(type, {
						type,
						count: passengerCounts[normalizedType],
						price: priceKey,
					});
				}
			});

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

			return Array.from(passengerPricesMap.values());
		}, [searchParams, flight.price]);

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

		const calculateTransferTime = useCallback(
			(segment1: FlightSegment, segment2: FlightSegment) => {
				try {
					// Extract datetime strings
					const arrDateTime = segment1.arr.datetime;
					const depDateTime = segment2.dep.datetime;

					if (!arrDateTime || !depDateTime) {
						console.warn("Arrival or Departure datetime is missing.");
						return "Transfer time unavailable";
					}

					// Convert datetime format from DD.MM.YYYY HH:mm:ss to ISO format
					const formatToISO = (dt: string) => {
						const [date, time] = dt.split(" ");
						const [day, month, year] = date.split(".");
						return `${year}-${month}-${day}T${time}`; // This creates a valid ISO format
					};

					// Create Date objects
					const arrivalTime = new Date(formatToISO(arrDateTime));
					const departureTime = new Date(formatToISO(depDateTime));

					// Check for valid dates
					if (isNaN(arrivalTime.getTime()) || isNaN(departureTime.getTime())) {
						console.warn("Invalid date format for arrival or departure.", {
							arrivalTime,
							departureTime,
						});
						return "Transfer time unavailable";
					}

					// Calculate transfer time in minutes
					const transferMinutes = Math.floor(
						(departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60)
					);

					return transferMinutes < 0
						? "Transfer time unavailable"
						: formatDuration(transferMinutes);
				} catch (error) {
					console.error("Error calculating transfer time:", error);
					return "Transfer time unavailable";
				}
			},
			[formatDuration]
		);

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
											{calculateTransferTime(
												segment,
												flight.segments[index + 1]
											)}
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

		const handlePrint = () => {
			const printContents = document.getElementById("print_area")?.innerHTML;
			if (printContents) {
				const originalContents = document.body.innerHTML;
				document.body.innerHTML = printContents;
				window.print();
				document.body.innerHTML = originalContents;
				window.location.reload();
			}
		};

		const AdditionalInfoModal = () => (
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="p-2 cursor-pointer"
						onClick={() => setIsModalOpen(true)}
					>
						<Info className="h-4 w-4" />
						Health Declaration and flight comments
					</Button>
				</DialogTrigger>
				<DialogContent className="min-w-6xl	max-h-[90vh]">
					<DialogHeader>
						<DialogTitle className="flex justify-items-start items-center gap-4">
							Additional Flight Information
							<Button variant="outline" size="icon" onClick={handlePrint}>
								<Printer className="h-4 w-4" />
							</Button>
						</DialogTitle>
					</DialogHeader>

					<ScrollArea className="h-[70vh] pr-4">
						<div id="print-area">
							{/* Segments Comments Section */}
							{Object.entries(apiData.data.segments_comments || {}).map(
								([hash, comment]) => (
									<div key={hash} className="mb-4">
										<h3 key={hash} className="font-semibold text-lg mb-2">
											Segment Comment
										</h3>
										<p className="text-muted-foreground">
											{comment
												? comment
												: "No comment available from this segment"}
										</p>
									</div>
								)
							)}

							{/* Health Declaration Section */}
							{apiData.data.health_declaration_text && (
								<div className="mt-6">
									<h3 className="font-semibold text-lg mb-2">
										COVID-19 Health Declaration
									</h3>
									<pre className="text-sm text-muted-foreground">
										{apiData.data.health_declaration_text}
									</pre>
								</div>
							)}
						</div>
					</ScrollArea>
				</DialogContent>
			</Dialog>
		);
		return (
			<Card
				className={`transition-all duration-300 py-0 shadow-lg ${
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
										<Button
											variant="outline"
											size="sm"
											className="p-2 cursor-pointer"
										>
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
					</CardHeader>

					<CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open] animate-collapsible-down transition-all duration-300 ease-in-out">
						<CardContent className="p-2 bg-accent dark:bg-blue-950/10 rounded-b-lg shadow-sm border-t-1 border-dashed border-muted-foreground/30">
							<div className="flex gap-2">
								{/* Detailed Segments Section */}
								<div className="space-y-2 w-[60%]">
									{flight.segments.map((segment, index) => {
										return (
											<div
												key={index}
												className="border-l-4 border-l-primary/50 dark:border-l-primary/50 border border-neutral-300 dark:border-blue-500/20 dark:bg-blue-950/20 rounded-r-lg px-4 py-2 shadow-md "
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
																	<span className="dark:text-white font-semibold">
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
													{/* Departure and Arrival Info */}
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

													<div className="flex items-center gap-2">
														<Plane className="w-5 h-5 text-muted-foreground rotate-90" />
														<div className="flex w-full gap-8 items-center">
															<div className="flex flex-col">
																<div className="font-semibold">
																	{segment.arr.time}
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

												{/* Transfer Information */}
												{index < flight.segments.length - 1 && (
													<div className="mt-2 dark:bg-blue-900/20 bg-red-100 border-l-4 border-red-500 p-2 rounded-r-lg">
														<div className="flex items-center gap-2">
															<Clock className="w-4 h-4 text-red-500 font-semibold" />
															<div className="text-xs dark:text-muted-foreground">
																Transfer at {segment.arr.airport.code}:{" "}
																<span className="dark:text-white font-semibold">
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
										);
									})}
								</div>

								{/* Pricing, Rules and Additional Details Section */}
								<div className="flex flex-col flex-1 gap-2">
									<div className="border-l-4 border-l-primary/50 dark:border-l-primary/50 border border-neutral-300 dark:border-blue-500/20 dark:bg-blue-950/10 rounded-r-lg px-4 py-2 shadow-lg">
										<div className="flex items-center justify-between">
											<h2 className="py-2">Ticket rules</h2>
											<Badge
												className="font-bold border px-2 border-gray-500"
												variant="secondary"
											>
												{fareFamilyDetails.name}
											</Badge>
										</div>

										<div className="flex justify-items-start gap-4 items-center">
											<div className="flex flex-col gap-2">
												<div className="flex items-center gap-2">
													<Luggage
														className={`w-5 h-5 ${
															fareFamilyDetails.checkedBaggage.includes("kg") ||
															fareFamilyDetails.checkedBaggage.includes("piece")
																? "text-green-500"
																: "text-red-500"
														}`}
													/>
													<span className="text-sm dark:text-muted-foreground">
														{fareFamilyDetails.checkedBaggage}{" "}
														{fareFamilyDetails.checkedBaggage.includes("KG")
															? ""
															: "KG"}
													</span>
												</div>

												<div className="flex items-center gap-2">
													<Handbag className="w-5 h-5 text-green-500" />
													<span className="text-sm dark:text-muted-foreground">
														{fareFamilyDetails.handBaggage.piece} piece,{" "}
														{fareFamilyDetails.handBaggage.weight}{" "}
														{fareFamilyDetails.handBaggage.weightUnit}
													</span>
												</div>
											</div>

											<div className="flex flex-col gap-2">
												<div className="flex items-center gap-2">
													<Repeat
														className={`w-5 h-5 ${
															fareFamilyDetails.change === "Non-changeable"
																? "text-red-500"
																: "text-green-500"
														}`}
													/>
													<span className="text-sm dark:text-muted-foreground">
														{fareFamilyDetails.change}
													</span>
												</div>

												<div className="flex items-center gap-2">
													<Undo2
														className={`w-5 h-5 ${
															fareFamilyDetails.refund === "Non-refundable"
																? "text-red-500"
																: "text-green-500"
														}`}
													/>
													<span className="text-sm dark:text-muted-foreground">
														{fareFamilyDetails.refund}
													</span>
												</div>
											</div>
										</div>
									</div>

									<div className="border-l-4 border-l-primary/50 dark:border-l-primary/50 border border-neutral-300 dark:border-blue-500/20 dark:bg-blue-950/10 rounded-r-lg px-4 py-2 shadow-lg">
										<div className="space-y-2">
											<h2 className="">Price per Passenger</h2>
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

									<div className="border-l-4 border-l-primary/50 dark:border-l-primary/50 border border-neutral-300 dark:border-blue-500/20 dark:bg-blue-950/10 rounded-r-lg px-4 py-2 shadow-lg h-full">
										<div className="space-y-2">
											<h2 className="">Additional Information</h2>
											<AdditionalInfoModal />
										</div>
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
