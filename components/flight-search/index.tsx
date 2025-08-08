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
		isPending,
		error,
		reset,
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
		isPending ||
		!watchedValues.fromAirport ||
		!watchedValues.toAirport ||
		!watchedValues.departureDate;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			onClick={handleClickOutside}
		>
			<Card className="w-full max-w-screen mx-auto bg-white/95 dark:bg-white/10 shadow-lg rounded-xl border-0">
				<CardContent className="px-4">
					<form onSubmit={handleSubmit}>
						{/* Header Row */}
						<div className="flex items-center justify-between mb-4">
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

							<MovingBorderButton className="flex gap-3">
								<Plane className="h-5 w-5 text-flight-primary" />
								<span className="text-sm font-medium">
									Cheapest tickets in town
								</span>
							</MovingBorderButton>
						</div>

						{/* Main Search Row */}
						<div className="flex items-center gap-1 rounded-lg border-2 px-2">
							<div className="flex items-center relative w-[55%]">
								{/* From Airport */}
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
									className="flex-1"
								/>

								{/* Swap Button */}
								<SwapButton
									onSwap={handleSwapAirports}
									disabled={
										!watchedValues.fromAirport && !watchedValues.toAirport
									}
								/>

								{/* To Airport */}
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
									className="flex-1 pl-8"
								/>
							</div>

							{/* Date Separator */}
							<div className="w-px h-14 bg-neutral-300 dark:bg-neutral-500" />

							{/* Date Picker */}
							<div className="flex-1 relative date-picker-container bg-white dark:bg-transparent ">
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
												variant="ghost"
												className={cn(
													"w-full h-12 pl-12 pr-10 cursor-pointer justify-start text-left font-normal hover:bg-slate-100 dark:hover:bg-black/30 rounded-lg",
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
														<span className="text-muted-foreground dark:text-neutral-400">
															Select date
														</span>
													)}
												</span>
											</Button>
										</div>
									</PopoverTrigger>

									<PopoverContent
										className="w-auto border-none p-0 shadow-lg overflow-hidden bg-transparent"
										align="start"
										side="bottom"
										sideOffset={6}
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
											onReturnDateChange={date => setValue("returnDate", date)}
											isRoundTrip={watchedValues.tripType === "roundtrip"}
											onClose={() => updateState({ showDatePicker: false })}
										/>
									</PopoverContent>
								</Popover>
							</div>

							{/* Passengers & Class */}
							<div className="w-px h-14 bg-neutral-300 dark:bg-neutral-500" />

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

													if (type === "infants" && next > current.adults) {
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

						{/* Bottom Row */}
						<div className="mt-4 flex items-center justify-between">
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
								isLoading={isPending}
								disabled={isSubmitDisabled}
								onSubmit={() => {}}
							/>
						</div>

						{error && (
							<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-600">{error.message}</p>
								{error.canRetry && (
									<button
										type="button"
										onClick={() => reset()}
										className="mt-2 text-xs text-red-700 underline"
									>
										Try again
									</button>
								)}
							</div>
						)}
					</form>
				</CardContent>
			</Card>
		</motion.div>
	);
};
