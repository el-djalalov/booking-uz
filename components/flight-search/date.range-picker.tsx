// components/flight-search/date-range-picker.tsx
"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { DateRangePickerProps } from "./types";

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
	departureDate,
	returnDate,
	onDepartureDateChange,
	onReturnDateChange,
	isRoundTrip,
	onClose,
}) => {
	const prevRangeRef = React.useRef<{ from?: string; to?: string }>({});

	const handleRangeSelect = (range: DateRange | undefined) => {
		if (!range?.from) return;

		const formattedFrom = format(range.from, "yyyy-MM-dd");
		const formattedTo = range.to ? format(range.to, "yyyy-MM-dd") : "";

		const prevFrom = prevRangeRef.current.from;
		const prevTo = prevRangeRef.current.to;
		if (prevFrom === formattedFrom && prevTo === formattedTo) return;

		prevRangeRef.current = { from: formattedFrom, to: formattedTo };

		if (isRoundTrip) {
			onDepartureDateChange(formattedFrom);

			if (range.to && formattedFrom !== formattedTo) {
				onReturnDateChange(formattedTo);
				setTimeout(() => onClose?.(), 300);
			} else {
				onReturnDateChange("");
			}
		} else {
			onDepartureDateChange(formattedFrom);
			onReturnDateChange("");
			setTimeout(() => onClose?.(), 200);
		}
	};

	const handleSingleSelect = (date: Date | undefined) => {
		if (date) {
			const formattedDate = format(date, "yyyy-MM-dd");
			onDepartureDateChange(formattedDate);
			onReturnDateChange("");
			setTimeout(() => onClose?.(), 200);
		}
	};

	React.useEffect(() => {
		prevRangeRef.current = {};
	}, [isRoundTrip]);

	const dateRange: DateRange | undefined = React.useMemo(() => {
		if (!isRoundTrip) return undefined;
		return {
			from: departureDate ? new Date(departureDate + "T00:00:00") : undefined,
			to: returnDate ? new Date(returnDate + "T00:00:00") : undefined,
		};
	}, [departureDate, returnDate, isRoundTrip]);

	const singleDate: Date | undefined = React.useMemo(() => {
		return !isRoundTrip && departureDate
			? new Date(departureDate + "T00:00:00")
			: undefined;
	}, [departureDate, isRoundTrip]);

	const today = React.useMemo(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), now.getDate());
	}, []);

	return (
		<div className="w-full dark:backdrop-blur-lg border rounded-xl border-neutral/20 shadow-xl overflow-hidden">
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
