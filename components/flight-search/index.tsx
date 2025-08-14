"use client";

import React from "react";
import { motion } from "motion/react";
import { Controller } from "react-hook-form";
import { CalendarIcon, PlaneTakeoff, PlaneLanding, Plane } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MovingBorderButton } from "@/components/ui/moving-border";
import { useFlightSearch } from "@/hooks/use-flight-search";
import { TripTypeSelector } from "./trip-type-selector";
import { AirportInput } from "./search-input";
import { SwapButton } from "./swap-btn";
import { PassengerClassSelector } from "./passanger-class-selector";
import { DirectFlightCheckbox } from "./direct-flight-checkbox";
import { SearchButton } from "./search-btn";
import { formatDateDisplay } from "./utils";
import { DateRangePicker } from "./date.range-picker";
import { toast } from "sonner";

export const FlightSearch = () => {
	const {
		form,
		state,
		watchedValues,
		updateState,
		closeAllDropdowns,
		handleSwapAirports,
		handleSubmit,
	} = useFlightSearch();

	const { control, setValue } = form;

	const handleClickOutside = (event: React.MouseEvent) => {
		const target = event.target as HTMLElement;
		if (
			!target.closest(".airport-search-container") &&
			!target.closest(".passengers-container") &&
			!target.closest(".date-picker-container")
		) {
			closeAllDropdowns();
		}
	};

	const isSubmitDisabled =
		!watchedValues.fromAirport ||
		!watchedValues.toAirport ||
		!watchedValues.departureDate;

	return (
		<div onClick={handleClickOutside}>
			<Card className="w-full max-w-screen mx-auto bg-white/95 dark:bg-white/10 shadow-lg rounded-xl transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in-0 border">
				<CardContent className="px-4">
					<form onSubmit={handleSubmit}>
						{/* Header Row */}
						<div className="flex flex-col gap-4">
							<div className="flex items-center justify-between">
								<div className="w-[30%]">
									<Controller
										name="tripType"
										control={control}
										render={({ field }) => (
											<TripTypeSelector
												value={field.value}
												onChange={field.onChange}
												onReturnDateReset={() => setValue("returnDate", "")}
											/>
										)}
									/>
								</div>

								<MovingBorderButton
									type="button"
									className="sm:flex gap-3 hidden sm:w-56"
								>
									<Plane className="h-5 w-5 text-flight-primary" />
									<span className="text-sm font-medium">
										Cheapest tickets in town
									</span>
								</MovingBorderButton>
							</div>

							{/* Responsive Search Layout */}
							<div className="space-y-2 xl:space-y-0 rounded-lg xl:border-2 xl:flex xl:p-1">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-2 relative">
									{/* From Airport */}
									<div className="relative">
										<AirportInput
											value={state.fromInputText}
											airport={watchedValues.fromAirport}
											placeholder="From"
											icon={PlaneTakeoff}
											onChange={value => updateState({ fromInputText: value })}
											onAirportSelect={airport => {
												setValue("fromAirport", airport);
												form.clearErrors("fromAirport");
											}}
											onClear={() => {
												updateState({ fromInputText: "" });
												setValue("fromAirport", null);
												updateState({ showFromSearch: false });
											}}
											showSearch={state.showFromSearch}
											onToggleSearch={show => {
												updateState({
													showFromSearch: show,
													showToSearch: false,
													showPassengers: false,
													showDatePicker: false,
												});
											}}
											className="w-full border px-2 rounded-lg xl:border-none"
										/>
									</div>

									{/* To Airport */}
									<div className="relative">
										<AirportInput
											value={state.toInputText}
											airport={watchedValues.toAirport}
											placeholder="To"
											icon={PlaneLanding}
											onChange={value => updateState({ toInputText: value })}
											onAirportSelect={airport => {
												setValue("toAirport", airport);
												form.clearErrors("toAirport");
											}}
											onClear={() => {
												updateState({ toInputText: "" });
												setValue("toAirport", null);
												updateState({ showToSearch: false });
											}}
											showSearch={state.showToSearch}
											onToggleSearch={show => {
												updateState({
													showToSearch: show,
													showFromSearch: false,
													showPassengers: false,
													showDatePicker: false,
												});
											}}
											className="border px-2 rounded-lg xl:border-none"
										/>
									</div>

									<div className="absolute left-1/2 top-1">
										<SwapButton
											onSwap={handleSwapAirports}
											disabled={
												!watchedValues.fromAirport && !watchedValues.toAirport
											}
										/>
									</div>
								</div>
								<div className="w-px h-12 bg-neutral-300 dark:bg-neutral-500 hidden xl:block" />
								<div className="grid grid-cols-1 md:grid-cols-2 xl:flex gap-2">
									{/* Date Picker */}
									<div className="relative date-picker-container bg-white dark:bg-transparent xl:w-96">
										<Popover
											open={state.showDatePicker}
											modal={false}
											onOpenChange={open => {
												if (!open) {
													const isRangeInProgress =
														watchedValues.tripType === "roundtrip" &&
														watchedValues.departureDate &&
														!watchedValues.returnDate;
													if (isRangeInProgress) return;
												}
												updateState({ showDatePicker: open });
											}}
										>
											<PopoverTrigger asChild>
												<div className="relative">
													<CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 z-10 dark:text-neutral-400 text-slate-500 pointer-events-none" />
													<Button
														type="button"
														variant="ghost"
														className={cn(
															"w-full h-12 pl-10 ml-1 pr-10 cursor-pointer justify-start text-left font-normal hover:bg-slate-100 dark:hover:bg-black/30 rounded-lg border xl:border-none",
															!watchedValues.departureDate &&
																"text-muted-foreground"
														)}
													>
														<span className="flex-1 text-[15px] font-semibold pt-1">
															{formatDateDisplay(
																watchedValues.departureDate,
																watchedValues.returnDate,
																watchedValues.tripType
															) || (
																<span className="text-muted-foreground dark:text-neutral-300">
																	Select date
																</span>
															)}
														</span>
													</Button>
												</div>
											</PopoverTrigger>

											<PopoverContent
												className="w-full border-none p-0 shadow-lg dark:bg-black/50"
												align="start"
												side="bottom"
												sideOffset={4}
												onOpenAutoFocus={e => e.preventDefault()}
												onInteractOutside={e => {
													const target = e.target as Element;
													const isRangeInProgress =
														watchedValues.tripType === "roundtrip" &&
														watchedValues.departureDate &&
														!watchedValues.returnDate;

													if (
														isRangeInProgress ||
														target.closest(".date-picker-container") ||
														target.closest("[data-slot='calendar']") ||
														target.closest("[data-day]")
													) {
														e.preventDefault();
													}
												}}
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
													onClose={() => updateState({ showDatePicker: false })}
												/>
											</PopoverContent>
										</Popover>
									</div>

									<div className="w-px h-12 bg-neutral-300 dark:bg-neutral-500 hidden xl:block" />

									{/* Passenger selector */}
									<div className="order-3 md:order-none rounded-lg border xl:border-none xl:w-full">
										<Controller
											name="passengers"
											control={control}
											render={({ field: passengersField }) => (
												<Controller
													name="travelClass"
													control={control}
													render={({ field: classField }) => (
														<PassengerClassSelector
															passengers={passengersField.value}
															travelClass={classField.value}
															isOpen={state.showPassengers}
															onToggle={() =>
																updateState({
																	showPassengers: !state.showPassengers,
																	showFromSearch: false,
																	showToSearch: false,
																	showDatePicker: false,
																})
															}
															onPassengerChange={(type, delta) => {
																const current = passengersField.value;
																const min = type === "adults" ? 1 : 0;
																const max = 9;

																let next = Math.max(
																	min,
																	Math.min(max, current[type] + delta)
																);

																if (
																	type === "infants" &&
																	next > current.adults
																) {
																	toast.error(
																		"Number of infants cannot exceed number of adults"
																	);
																	return;
																}

																passengersField.onChange({
																	...current,
																	[type]: next,
																});
															}}
															onClassChange={classField.onChange}
														/>
													)}
												/>
											)}
										/>
									</div>
								</div>
							</div>

							<div className="flex flex-row-reverse md:flex-row sm:items-center justify-between gap-3 order-4 md:order-none">
								<Controller
									name="directOnly"
									control={control}
									render={({ field }) => (
										<DirectFlightCheckbox
											checked={field.value as boolean}
											onCheckedChange={field.onChange}
										/>
									)}
								/>

								<SearchButton
									isLoading={false}
									disabled={isSubmitDisabled}
									onSubmit={() => {}}
								/>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
