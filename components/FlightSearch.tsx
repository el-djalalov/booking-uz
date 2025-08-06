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
	RefreshCcw,
	ArrowRight,
	X,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MovingBorderButton } from "./ui/moving-border";

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
	const handleRangeSelect = (range: DateRange | undefined) => {
		if (!range) return;

		if (range.from) {
			const formattedFrom = format(range.from, "yyyy-MM-dd");
			onDepartureDateChange(formattedFrom);

			if (isRoundTrip) {
				if (range.to) {
					// Both dates selected - complete the selection
					const formattedTo = format(range.to, "yyyy-MM-dd");
					onReturnDateChange(formattedTo);
					// Use a longer timeout to ensure state updates complete
					setTimeout(() => onClose?.(), 200);
				} else {
					// Only first date selected - clear return and DON'T close
					onReturnDateChange("");
					// ✅ Critical: Don't call onClose here for range selection
				}
			} else {
				// One-way trip - clear return date and close
				onReturnDateChange("");
				setTimeout(() => onClose?.(), 150);
			}
		}
	};

	// Handle single date selection for one-way trips
	const handleSingleSelect = (date: Date | undefined) => {
		if (date) {
			const formattedDate = format(date, "yyyy-MM-dd");
			onDepartureDateChange(formattedDate);
			onReturnDateChange("");
			setTimeout(() => onClose?.(), 150);
		}
	};

	// Convert string dates to Date objects with error handling
	const dateRange: DateRange | undefined = React.useMemo(() => {
		if (!isRoundTrip) return undefined;

		try {
			return {
				from: departureDate ? new Date(departureDate + "T00:00:00") : undefined,
				to: returnDate ? new Date(returnDate + "T00:00:00") : undefined,
			};
		} catch (error) {
			console.error("Date parsing error:", error);
			return undefined;
		}
	}, [departureDate, returnDate, isRoundTrip]);

	const singleDate: Date | undefined = React.useMemo(() => {
		try {
			return !isRoundTrip && departureDate
				? new Date(departureDate + "T00:00:00")
				: undefined;
		} catch (error) {
			console.error("Single date parsing error:", error);
			return undefined;
		}
	}, [departureDate, isRoundTrip]);

	const today = React.useMemo(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), now.getDate());
	}, []);

	return (
		<div className="w-auto bg-white dark:bg-neutral-900/90 dark:backdrop-blur-lg border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden">
			{isRoundTrip ? (
				<Calendar
					mode="range"
					defaultMonth={dateRange?.from || new Date()}
					selected={dateRange}
					onSelect={handleRangeSelect}
					numberOfMonths={2}
					disabled={date => date < today}
					className="rounded-lg border-0 p-3"
				/>
			) : (
				<Calendar
					mode="single"
					defaultMonth={singleDate || new Date()}
					selected={singleDate}
					onSelect={handleSingleSelect}
					disabled={date => date < today}
					className="rounded-lg border-0 p-3"
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
		if (!departureDate) return null; // Return null instead of empty string

		if (tripType === "oneway") {
			return format(new Date(departureDate), "MMM dd, yyyy");
		}

		if (returnDate) {
			return `${format(new Date(departureDate), "MMM dd")} - ${format(
				new Date(returnDate),
				"MMM dd, yyyy"
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
			<Card className="w-full max-w-screen mx-auto bg-white/95 dark:bg-white/10 shadow-lg rounded-xl border-0">
				<CardContent className="px-4">
					<form onSubmit={handleSubmit(onSubmit)}>
						{/* Trip selection */}
						<div className="flex items-center justify-between mb-4">
							<div className="w-[30%]">
								<Controller
									name="tripType"
									control={control}
									render={({ field }) => (
										<div className="relative">
											<div className="flex bg-slate-100 dark:bg-white/15 p-1 rounded-lg relative overflow-hidden h-10">
												{/* Sliding white background */}
												<div
													className="absolute top-1 bottom-1 w-1/2 bg-white rounded-md shadow-sm transition-transform duration-300 ease-out"
													style={{
														transform:
															field.value === "roundtrip"
																? "translateX(0%)"
																: "translateX(95%)",
													}}
												/>

												{/* Tab buttons */}
												<button
													type="button"
													onClick={() => {
														field.onChange("roundtrip");
														setValue("returnDate", "");
													}}
													className={`relative z-10 flex items-center pl-2 justify-items-start gap-2 h-8 flex-1 text-sm font-medium transition-colors duration-300  ${
														field.value === "roundtrip"
															? "text-slate-900"
															: "text-slate-600 hover:text-slate-800 dark:text-white"
													}`}
												>
													<RefreshCcw className="h-4 w-4" />
													Round trip
												</button>
												<button
													type="button"
													onClick={() => {
														field.onChange("oneway");
														setValue("returnDate", undefined);
													}}
													className={`relative z-10 flex items-center ml-4 justify-items-start px-2 gap-2 h-8 flex-1 text-sm font-medium transition-colors duration-300 ${
														field.value === "oneway"
															? "text-slate-900"
															: "text-slate-600 hover:text-slate-800 dark:text-white"
													}`}
												>
													<ArrowRight className="h-4 w-4" />
													One way
												</button>
											</div>
										</div>
									)}
								/>
							</div>

							<MovingBorderButton className="flex gap-3">
								<Plane className="h-5 w-5 text-flight-primary" />
								<span className="text-sm font-medium ">
									Cheapest tickets in town
								</span>
							</MovingBorderButton>
						</div>

						{/* Main Search Row */}
						<div className="flex items-center gap-1 rounded-lg border-2 px-2">
							<div className="flex items-center relative w-[55%]">
								{/* From Airport */}
								<div className="flex-1 relative airport-search-container">
									<div className="border-gray-200">
										<div className="relative flex justify-center items-center">
											<PlaneTakeoff
												size={28}
												className="dark:text-neutral-400 text-slate-400"
											/>
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
													if (
														!watchedValues.fromAirport &&
														fromInputText.length >= 3
													) {
														setShowFromSearch(true);
														setShowToSearch(false);
														setShowPassengers(false);
														setShowDatePicker(false);
													}
												}}
												className="truncate border-0 py-0 pl-2 pr-4 h-12 font-medium focus-visible:ring-0 translate-1 placeholder:text-slate-400 dark:placeholder:text-neutral-400 placeholder:text-[15px] dark:bg-transparent dark:text-white"
												style={{ fontSize: "15px" }}
											/>
											{fromInputText && (
												<button
													type="button"
													onClick={() => {
														setFromInputText("");
														setValue("fromAirport", null);
														setShowFromSearch(false);
													}}
													className="absolute right-6 p-0.5 mt-1 bg-slate-400/50 hover:bg-neutral-300 rounded-full transition-colors"
												>
													<X
														size={16}
														className="text-slate-600 dark:text-slate-900"
													/>
												</button>
											)}
										</div>

										<AnimatePresence>
											{showFromSearch && (
												<motion.div
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -10 }}
													className="absolute top-full -left-2 right-0 z-50 mt-2"
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
								<div className="absolute left-1/2 top-1 transform -translate-x-1/2 z-20 group">
									<motion.div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleSwapAirports}
											disabled={
												!watchedValues.fromAirport && !watchedValues.toAirport
											}
											className="h-10 w-10 rounded-full bg-white border-2 border-slate-300 group-hover:border-primary shadow-sm relative z-20"
										></Button>

										<MoveLeft
											onClick={handleSwapAirports}
											size={18}
											className="group-hover:-translate-x-3 group-hover:text-primary absolute top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-2 text-neutral-400 z-20 transition duration-300 hover:bg-transparent"
										/>
										<MoveRight
											onClick={handleSwapAirports}
											size={18}
											className="group-hover:-translate-x-1.5 group-hover:text-primary absolute top-6.5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-2 text-neutral-400 z-20 transition duration-300"
										/>
									</motion.div>
									<div className="w-px h-14 bg-neutral-300 dark:bg-neutral-500 absolute top-0 transform translate-x-5 -translate-y-2 z-10" />
								</div>

								{/* To Airport */}
								<div className="flex-1 relative airport-search-container">
									<div className="pl-8">
										<div className="relative">
											<div className="relative flex justify-center items-center">
												<PlaneLanding
													size={28}
													className="dark:text-neutral-400 text-slate-400"
												/>
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
														if (
															!watchedValues.fromAirport &&
															toInputText.length >= 3
														) {
															setShowToSearch(true);
															setShowFromSearch(false);
															setShowPassengers(false);
															setShowDatePicker(false);
														}
													}}
													className="truncate border-0 py-0 pl-2 pr-4 h-12 font-medium focus-visible:ring-0 translate-1 placeholder:text-slate-400 dark:placeholder:text-neutral-400 placeholder:text-[15px] dark:bg-transparent dark:text-white"
													style={{ fontSize: "15px" }}
												/>
												{toInputText && (
													<button
														type="button"
														onClick={() => {
															setToInputText("");
															setValue("toAirport", null);
															setShowFromSearch(false);
														}}
														className="absolute right-0 p-0.5 mt-1 bg-slate-400/50 hover:bg-neutral-300 rounded-full transition-colors"
													>
														<X
															size={16}
															className="text-slate-600 dark:text-slate-900"
														/>
													</button>
												)}
											</div>
										</div>

										<AnimatePresence>
											{showToSearch && (
												<motion.div
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -10 }}
													className="absolute top-full left-5 right-0 z-50 mt-2"
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
							<div className="w-px h-14 bg-neutral-300 dark:bg-neutral-500" />

							{/* Date Picker */}

							<div className="flex-1 relative date-picker-container bg-white dark:bg-transparent">
								<Popover
									open={showDatePicker}
									onOpenChange={open => {
										// ✅ More robust prevention of auto-closing
										if (!open) {
											const isRangeInProgress =
												watchedValues.tripType === "roundtrip" &&
												watchedValues.departureDate &&
												!watchedValues.returnDate;

											if (isRangeInProgress) {
												// Don't allow closing during range selection
												console.log("Preventing close during range selection");
												return;
											}
										}
										setShowDatePicker(open);
									}}
								>
									<PopoverTrigger asChild>
										<div className="relative">
											<CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 z-10 dark:text-neutral-400 text-slate-500 pointer-events-none" />

											<Button
												variant="ghost"
												className={cn(
													"w-full h-12 pl-12 pr-10 justify-start text-left font-normal hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg",
													!watchedValues.departureDate &&
														"text-muted-foreground"
												)}
											>
												<span className="flex-1 text-[15px]">
													{formatDateDisplay(
														watchedValues.departureDate,
														watchedValues.returnDate,
														watchedValues.tripType
													) || (
														<span className="text-muted-foreground dark:text-neutral-400">
															Select date
														</span>
													)}
												</span>
											</Button>

											{(watchedValues.departureDate ||
												watchedValues.returnDate) && (
												<div
													onClick={e => {
														e.stopPropagation();
														setValue("departureDate", "");
														setValue("returnDate", "");
														setShowDatePicker(false);
													}}
													className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-full transition-colors cursor-pointer z-10"
													role="button"
													tabIndex={0}
													onKeyDown={e => {
														if (e.key === "Enter" || e.key === " ") {
															e.stopPropagation();
															setValue("departureDate", "");
															setValue("returnDate", "");
															setShowDatePicker(false);
														}
													}}
												>
													<X size={12} className="text-white" />
												</div>
											)}
										</div>
									</PopoverTrigger>

									<PopoverContent
										className="w-auto border-none p-0 shadow-lg overflow-hidden bg-transparent"
										align="start"
										side="bottom"
										sideOffset={6}
										onOpenAutoFocus={e => {
											e.preventDefault();
										}}
										onInteractOutside={e => {
											const target = e.target as Element;
											if (
												target.closest(".date-picker-container") ||
												target.closest("[data-radix-calendar]") ||
												target.closest('[role="gridcell"]')
											) {
												e.preventDefault();
											}
										}}
										onFocusOutside={e => {
											const target = e.target as Element;
											if (target.closest("[data-radix-calendar]")) {
												e.preventDefault();
											}
										}}
									>
										<DateRangePicker
											departureDate={watchedValues.departureDate}
											returnDate={watchedValues.returnDate}
											onDepartureDateChange={date => {
												setValue("departureDate", date);
											}}
											onReturnDateChange={date => {
												setValue("returnDate", date);
											}}
											isRoundTrip={watchedValues.tripType === "roundtrip"}
											onClose={() => {
												console.log("DateRangePicker requesting close");
												setShowDatePicker(false);
											}}
										/>
									</PopoverContent>
								</Popover>
							</div>

							{/* Passengers & Class Combined */}
							<div className="w-px h-14 bg-neutral-300 dark:bg-neutral-500" />

							<div className="flex-1 relative passengers-container">
								<div className="px-3 py-2">
									{/* 	<Label className="text-xs text-gray-600 mb-1 block">
										PASSENGERS & CLASS
									</Label> */}
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
											defaultChecked={true}
										/>
										<Label
											htmlFor="directFlight"
											className="text-sm text-foreground cursor-pointer"
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
									className="h-12 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg"
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
											>
												<Plane className="h-6 w-6" />
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
						{/* 	{Object.keys(errors).length > 0 && (
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
						)} */}
					</form>
				</CardContent>
			</Card>
		</motion.div>
	);
};
