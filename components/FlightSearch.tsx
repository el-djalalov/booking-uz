// components/flight-search.tsx
"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Calendar as CalendarIcon,
	Users,
	ArrowRightLeft,
	Plus,
	Minus,
	Plane,
	ChevronDown,
	Search,
	MapPin,
	ChevronLeft,
	ChevronRight,
	PlaneTakeoff,
	PlaneLanding,
	MoveRight,
	MoveLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
	flightSearchSchema,
	type FlightSearchFormData,
} from "@/lib/schema/flight-search";
import {
	format,
	addMonths,
	startOfMonth,
	endOfMonth,
	isSameMonth,
	isToday,
	isBefore,
} from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { AirportSearch } from "@/hooks/use-airport-search";
import { Airport } from "@/types/shared";
import { useTransition } from "react";
import { searchFlights } from "@/app/actions/actions";
import { Calendar } from "@/components/ui/calendar";
import { type DateRange } from "react-day-picker";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
// Updated Date Range Picker Component using shadcn Calendar
const DateRangePicker = ({
	departureDate,
	returnDate,
	onDepartureDateChange,
	onReturnDateChange,
	isRoundTrip,
	onClose,
}: {
	departureDate: string;
	returnDate?: string;
	onDepartureDateChange: (date: string) => void;
	onReturnDateChange: (date: string) => void;
	isRoundTrip: boolean;
	onClose?: () => void;
}) => {
	// Handle range selection for round trip
	const handleRangeSelect = (range: DateRange | undefined) => {
		if (!range) return;

		if (range.from) {
			onDepartureDateChange(format(range.from, "yyyy-MM-dd"));
		}

		if (isRoundTrip && range.to) {
			onReturnDateChange(format(range.to, "yyyy-MM-dd"));
			// Close after both dates are selected for round trip
			setTimeout(() => onClose?.(), 100);
		} else if (isRoundTrip && !range.to) {
			// Clear return date if no end date is selected
			onReturnDateChange("");
		}
	};

	// Handle single date selection for one-way
	const handleSingleSelect = (date: Date | undefined) => {
		if (date) {
			onDepartureDateChange(format(date, "yyyy-MM-dd"));
			onReturnDateChange(""); // Clear return date for one-way
			// Close immediately after selecting single date
			setTimeout(() => onClose?.(), 100);
		}
	};

	// Convert string dates to Date objects
	const dateRange: DateRange | undefined = React.useMemo(() => {
		if (!isRoundTrip) return undefined;

		return {
			from: departureDate ? new Date(departureDate) : undefined,
			to: returnDate ? new Date(returnDate) : undefined,
		};
	}, [departureDate, returnDate, isRoundTrip]);

	const singleDate: Date | undefined = React.useMemo(() => {
		return departureDate ? new Date(departureDate) : undefined;
	}, [departureDate]);

	// FIXED: Create today's date at midnight for proper comparison
	const today = React.useMemo(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), now.getDate());
	}, []);

	return (
		<div className="w-auto bg-white">
			{isRoundTrip ? (
				// Range picker for round trip
				<Calendar
					mode="range"
					defaultMonth={dateRange?.from || new Date()}
					selected={dateRange}
					onSelect={handleRangeSelect}
					numberOfMonths={2}
					disabled={date => date < today} // FIXED: Compare Date with Date
					className="rounded-lg border-0"
				/>
			) : (
				// Single date picker for one-way
				<Calendar
					mode="single"
					defaultMonth={singleDate || new Date()}
					selected={singleDate}
					onSelect={handleSingleSelect}
					disabled={date => date < today} // FIXED: Compare Date with Date
					className="rounded-lg border-0"
				/>
			)}
		</div>
	);
};

export const FlightSearch = () => {
	const [showFromSearch, setShowFromSearch] = useState(false);
	const [showToSearch, setShowToSearch] = useState(false);
	const [showPassengers, setShowPassengers] = useState(false);
	const [showDatePicker, setShowDatePicker] = useState(false);

	const [fromInputText, setFromInputText] = useState("");
	const [toInputText, setToInputText] = useState("");

	const form = useForm<FlightSearchFormData>({
		resolver: zodResolver(flightSearchSchema),
		defaultValues: {
			tripType: "roundtrip",
			fromAirport: null,
			toAirport: null,
			departureDate: "",
			returnDate: undefined,
			passengers: {
				adults: 1,
				children: 0,
				infants: 0,
			},
			travelClass: "e", // economy
			directOnly: false,
		},
	});

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = form;
	const watchedValues = watch();

	// ADD: Update input text when airport is selected
	React.useEffect(() => {
		if (watchedValues.fromAirport) {
			setFromInputText(
				`${watchedValues.fromAirport.iata} - ${watchedValues.fromAirport.name}`
			);
		} else {
			setFromInputText("");
		}
	}, [watchedValues.fromAirport]);

	React.useEffect(() => {
		if (watchedValues.toAirport) {
			setToInputText(
				`${watchedValues.toAirport.iata} - ${watchedValues.toAirport.name}`
			);
		} else {
			setToInputText("");
		}
	}, [watchedValues.toAirport]);

	const handleSwapAirports = () => {
		const fromAirport = watchedValues.fromAirport;
		const toAirport = watchedValues.toAirport;
		setValue("fromAirport", toAirport);
		setValue("toAirport", fromAirport);

		if (navigator.vibrate) {
			navigator.vibrate(50);
		}
	};

	const updatePassengerCount = (
		type: "adults" | "children" | "infants",
		delta: number
	) => {
		const current = watchedValues.passengers[type];
		const min = type === "adults" ? 1 : 0;
		const max = 9;
		const newValue = Math.max(min, Math.min(max, current + delta));
		setValue(`passengers.${type}`, newValue);

		if (type === "infants" && newValue > watchedValues.passengers.adults) {
			toast.error("Number of infants cannot exceed number of adults");
			return;
		}
	};

	const getTotalPassengers = () => {
		const { adults, children, infants } = watchedValues.passengers;
		return adults + children + infants;
	};

	const getPassengerText = () => {
		const total = getTotalPassengers();
		const { adults, children, infants } = watchedValues.passengers;

		if (total === 1 && adults === 1) return "1 Adult";

		const parts = [];
		if (adults) parts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
		if (children) parts.push(`${children} Child${children > 1 ? "ren" : ""}`);
		if (infants) parts.push(`${infants} Infant${infants > 1 ? "s" : ""}`);

		return parts.join(", ");
	};

	const getClassDisplayName = (classCode: string) => {
		const classMap = {
			e: "Economy",
			w: "Premium Economy",
			b: "Business",
			f: "First Class",
		};
		return classMap[classCode as keyof typeof classMap] || "Economy";
	};

	const [isPending, startTransition] = useTransition();

	const onSubmit = (data: FlightSearchFormData) => {
		startTransition(async () => {
			const result = await searchFlights(data);
			if (result.error) {
				toast.error(result.error);
			} else {
				console.log(result.data);
				toast.success("Flights found!");
			}
		});
	};

	const handleClickOutside = (event: React.MouseEvent) => {
		const target = event.target as HTMLElement;
		if (
			!target.closest(".airport-search-container") &&
			!target.closest(".passengers-container") &&
			!target.closest(".date-picker-container")
		) {
			setShowFromSearch(false);
			setShowToSearch(false);
			setShowPassengers(false);
			setShowDatePicker(false);
		}
	};

	const formatDateDisplay = (
		departureDate: string,
		returnDate?: string,
		tripType?: string
	) => {
		if (!departureDate) return "Select dates";

		if (tripType === "oneway") {
			return format(new Date(departureDate), "MMM dd");
		}

		if (returnDate) {
			return `${format(new Date(departureDate), "MMM dd")} - ${format(
				new Date(returnDate),
				"MMM dd"
			)}`;
		}

		return `${format(new Date(departureDate), "MMM dd")} - Return`;
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			onClick={handleClickOutside}
		>
			<Card className="w-full max-w-screen mx-auto bg-white backdrop-blur-sm shadow-lg rounded-2xl border-0">
				<CardContent className="px-4">
					<form onSubmit={handleSubmit(onSubmit)}>
						{/* Trip Type Toggle */}
						<div className=" flex gap-2 mb-4 items-center">
							<div className="flex gap-2 mb-4">
								<Controller
									name="tripType"
									control={control}
									render={({ field }) => (
										<>
											<Button
												type="button"
												variant={
													field.value === "roundtrip" ? "default" : "ghost"
												}
												size="sm"
												onClick={() => {
													field.onChange("roundtrip");
													setValue("returnDate", "");
												}}
												className="text-sm font-medium"
											>
												Round Trip
											</Button>
											<Button
												type="button"
												variant={field.value === "oneway" ? "default" : "ghost"}
												size="sm"
												onClick={() => {
													field.onChange("oneway");
													setValue("returnDate", undefined);
												}}
												className="text-sm font-medium"
											>
												One Way
											</Button>
										</>
									)}
								/>
							</div>
						</div>

						{/* Main Search Row */}
						<div className="flex items-center gap-1 rounded-lg border-2 px-2">
							<div className="flex items-center relative">
								{/* From Airport */}
								<div className="flex-1 relative airport-search-container">
									<div className="border-gray-200">
										<div className="relative flex justify-center items-center">
											<PlaneTakeoff size={28} className="text-slate-400" />
											<Input
												type="text"
												placeholder="From"
												value={fromInputText}
												onChange={e => {
													const inputValue = e.target.value;
													setFromInputText(inputValue);

													if (
														watchedValues.fromAirport &&
														inputValue !==
															`${watchedValues.fromAirport.iata} - ${watchedValues.fromAirport.name}`
													) {
														setValue("fromAirport", null);
													}

													if (inputValue.length >= 3) {
														setShowFromSearch(true);
														setShowToSearch(false);
														setShowPassengers(false);
														setShowDatePicker(false);
													} else {
														setShowFromSearch(false);
													}
												}}
												onFocus={() => {
													if (fromInputText.length >= 3) {
														setShowFromSearch(true);
														setShowToSearch(false);
														setShowPassengers(false);
														setShowDatePicker(false);
													}
												}}
												className="border-0 py-0 pl-2 h-12 text-lg font-medium focus-visible:ring-0 translate-1 placeholder:text-slate-400 placeholder:text-lg"
											/>
										</div>

										<AnimatePresence>
											{showFromSearch && (
												<motion.div
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -10 }}
													className="absolute z-50 w-full mt-2 left-0"
												>
													<AirportSearch
														query={fromInputText}
														onSelect={(airport: Airport) => {
															setValue("fromAirport", airport);
															setShowFromSearch(false);
															if (errors.fromAirport) {
																form.clearErrors("fromAirport");
															}
														}}
														onClose={() => setShowFromSearch(false)}
													/>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</div>

								{/* Overlapping Swap Button */}
								<div className="absolute left-1/2 top-0.5 transform -translate-x-1/2 z-20 group">
									<motion.div
									//whileHover={{ scale: 1.1 }}
									//whileTap={{ scale: 0.9 }}
									>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleSwapAirports}
											disabled={
												!watchedValues.fromAirport && !watchedValues.toAirport
											}
											className="h-10 w-10 rounded-full bg-white border-2 border-slate-300 group-hover:border-blue-500 hover:bg-slate-50 shadow-sm relative z-20"
										>
											{/* 											<ArrowRightLeft className="h-4 w-4 text-gray-600 hover:text-blue-600" />
											 */}{" "}
										</Button>

										<MoveLeft
											size={18}
											className="group-hover:-translate-x-3 group-hover:text-blue-500 absolute top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-2 text-slate-400 z-20 transition duration-300"
										/>
										<MoveRight
											size={18}
											className="group-hover:-translate-x-1.5 group-hover:text-blue-500 absolute top-6.5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-2 text-slate-400 z-20 transition duration-300"
										/>
									</motion.div>
									<div className="w-px h-16 bg-slate-300 absolute top-0 transform translate-x-5 -translate-y-2 z-10" />
								</div>

								{/* To Airport */}
								<div className="flex-1 relative airport-search-container">
									<div className="px-4 pl-8">
										<div className="relative">
											<div className="relative flex justify-center items-center">
												<PlaneLanding size={28} className="text-slate-400" />
												<Input
													type="text"
													placeholder="To"
													value={toInputText}
													onChange={e => {
														const inputValue = e.target.value;
														setToInputText(inputValue);

														if (
															watchedValues.toAirport &&
															inputValue !==
																`${watchedValues.toAirport.iata} - ${watchedValues.toAirport.name}`
														) {
															setValue("toAirport", null);
														}

														if (inputValue.length >= 3) {
															setShowToSearch(true);
															setShowFromSearch(false);
															setShowPassengers(false);
															setShowDatePicker(false);
														} else {
															setShowToSearch(false);
														}
													}}
													onFocus={() => {
														if (toInputText.length >= 3) {
															setShowToSearch(true);
															setShowFromSearch(false);
															setShowPassengers(false);
															setShowDatePicker(false);
														}
													}}
													className="border-0 py-0 pl-2 h-12 font-medium focus-visible:ring-0 translate-1 placeholder:text-slate-400 placeholder:text-lg"
												/>
											</div>
										</div>

										<AnimatePresence>
											{showToSearch && (
												<motion.div
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -10 }}
													className="absolute z-50 w-full mt-2 right-0"
												>
													<AirportSearch
														query={toInputText}
														onSelect={(airport: Airport) => {
															setValue("toAirport", airport);
															setShowToSearch(false);
															if (errors.toAirport) {
																form.clearErrors("toAirport");
															}
														}}
														onClose={() => setShowToSearch(false)}
													/>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</div>
							</div>

							{/* Date Separator */}
							<div className="w-px h-12 bg-slate-300 mx-1" />

							{/* Date Picker */}
							<div className="flex-1 relative date-picker-container">
								<div className="px-3 py-2">
									<Label className="text-xs text-gray-600 mb-1 block">
										{watchedValues.tripType === "roundtrip"
											? "DEPARTURE - RETURN"
											: "DEPARTURE"}
									</Label>
									<Popover
										open={showDatePicker}
										onOpenChange={setShowDatePicker}
									>
										<PopoverTrigger asChild>
											<Button
												variant="ghost"
												className={cn(
													"p-0 h-auto text-sm font-medium justify-start hover:bg-transparent w-full",
													!watchedValues.departureDate &&
														"text-muted-foreground"
												)}
											>
												<div className="flex items-center gap-2 text-left">
													<CalendarIcon className="h-4 w-4 text-gray-400" />
													<span>
														{formatDateDisplay(
															watchedValues.departureDate,
															watchedValues.returnDate,
															watchedValues.tripType
														)}
													</span>
												</div>
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="w-auto p-4 bg-white shadow-lg border" // Fixed: Explicit background and styling
											align="start"
											side="bottom"
											sideOffset={4}
										>
											<DateRangePicker
												departureDate={watchedValues.departureDate}
												returnDate={watchedValues.returnDate}
												onDepartureDateChange={date =>
													setValue("departureDate", date)
												}
												onReturnDateChange={date =>
													setValue("returnDate", date)
												}
												isRoundTrip={watchedValues.tripType === "roundtrip"}
												onClose={() => setShowDatePicker(false)} // Fixed: Add close handler
											/>
										</PopoverContent>
									</Popover>
								</div>
							</div>

							{/* Passengers & Class Combined */}
							<div className="w-px h-12 bg-slate-300 mx-1" />

							<div className="flex-1 relative passengers-container">
								<div className="px-3 py-2">
									<Label className="text-xs text-gray-600 mb-1 block">
										PASSENGERS & CLASS
									</Label>
									<Button
										type="button"
										variant="ghost"
										onClick={() => {
											setShowPassengers(!showPassengers);
											setShowFromSearch(false);
											setShowToSearch(false);
											setShowDatePicker(false);
										}}
										className="p-0 h-auto text-sm font-medium justify-start hover:bg-transparent flex items-center gap-1 w-full"
									>
										<div className="flex items-center gap-2 text-left">
											<Users className="h-4 w-4 text-gray-400" />
											<span>{getPassengerText()}</span>
											<span className="text-gray-400">•</span>
											<span>
												{getClassDisplayName(watchedValues.travelClass)}
											</span>
											<ChevronDown className="h-3 w-3 ml-1" />
										</div>
									</Button>

									<AnimatePresence>
										{showPassengers && (
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -10 }}
												className="absolute z-50 right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-80"
											>
												{/* Passengers Section */}
												<div className="space-y-3 mb-4">
													<h4 className="font-medium text-sm">Passengers</h4>
													{(["adults", "children", "infants"] as const).map(
														type => (
															<div
																key={type}
																className="flex items-center justify-between"
															>
																<div>
																	<div className="font-medium text-sm capitalize">
																		{type}
																	</div>
																	<div className="text-xs text-gray-500">
																		{type === "adults" && "12+ years"}
																		{type === "children" && "2-11 years"}
																		{type === "infants" && "0-2 years"}
																	</div>
																</div>
																<div className="flex items-center gap-2">
																	<Button
																		type="button"
																		variant="outline"
																		size="sm"
																		onClick={() =>
																			updatePassengerCount(type, -1)
																		}
																		disabled={
																			watchedValues.passengers[type] <=
																			(type === "adults" ? 1 : 0)
																		}
																		className="h-6 w-6 p-0"
																	>
																		<Minus className="h-3 w-3" />
																	</Button>
																	<span className="w-6 text-center text-sm font-medium">
																		{watchedValues.passengers[type]}
																	</span>
																	<Button
																		type="button"
																		variant="outline"
																		size="sm"
																		onClick={() =>
																			updatePassengerCount(type, 1)
																		}
																		disabled={
																			watchedValues.passengers[type] >= 9
																		}
																		className="h-6 w-6 p-0"
																	>
																		<Plus className="h-3 w-3" />
																	</Button>
																</div>
															</div>
														)
													)}
												</div>

												{/* Class Selection */}
												<div className="border-t pt-3">
													<h4 className="font-medium text-sm mb-2">
														Travel Class
													</h4>
													<Controller
														name="travelClass"
														control={control}
														render={({ field }) => (
															<Select
																value={field.value}
																onValueChange={field.onChange}
															>
																<SelectTrigger className="h-8 text-sm">
																	<SelectValue>
																		{getClassDisplayName(field.value)}
																	</SelectValue>
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="e">Economy</SelectItem>
																	<SelectItem value="w">
																		Premium Economy
																	</SelectItem>
																	<SelectItem value="b">Business</SelectItem>
																	<SelectItem value="f">First Class</SelectItem>
																</SelectContent>
															</Select>
														)}
													/>
												</div>

												{/* Done Button */}
												<div className="mt-4 pt-3 border-t">
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => setShowPassengers(false)}
														className="w-full"
													>
														Done
													</Button>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</div>
						</div>

						<div className="mt-4 flex items-center justify-between">
							<Controller
								name="directOnly"
								control={control}
								render={({ field }) => (
									<div className="flex items-center gap-3">
										<Checkbox
											id="directFlight"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
										<Label
											htmlFor="directFlight"
											className="text-sm text-gray-600 cursor-pointer"
										>
											Direct flights only
										</Label>
									</div>
								)}
							/>

							{/* Search Button */}
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Button
									type="submit"
									disabled={
										isPending ||
										!watchedValues.fromAirport ||
										!watchedValues.toAirport ||
										!watchedValues.departureDate
									}
									className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
								>
									{isPending ? (
										<>
											<motion.div
												animate={{ rotate: 360 }}
												transition={{
													duration: 1,
													repeat: Infinity,
													ease: "linear",
												}}
												className="mr-2"
											>
												<Plane className="h-4 w-4" />
											</motion.div>
											Searching...
										</>
									) : (
										<>
											<Plane className="mr-2 h-4 w-4" />
											Search
										</>
									)}
								</Button>
							</motion.div>
						</div>

						{/* Error Messages */}
						{Object.keys(errors).length > 0 && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								className="mt-3 p-3 bg-red-50 rounded-lg"
							>
								<div className="text-sm text-red-600 space-y-1">
									{errors.fromAirport && <p>• {errors.fromAirport.message}</p>}
									{errors.toAirport && <p>• {errors.toAirport.message}</p>}
									{errors.departureDate && (
										<p>• {errors.departureDate.message}</p>
									)}
									{errors.returnDate && <p>• {errors.returnDate.message}</p>}
								</div>
							</motion.div>
						)}
					</form>
				</CardContent>
			</Card>
		</motion.div>
	);
};
