import { FlightSegment } from "@/types/flight-search";
import { useCallback } from "react";

export const formatDate = (dateStr: string) => {
	const [day, month, year] = dateStr.split(".");
	const date = new Date(`${year}-${month}-${day}`);
	const options: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "short",
		weekday: "short",
	};
	return date.toLocaleDateString("en-US", options);
};

export const formatPrice = (amount: number) =>
	new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(amount) +
	" RUB";

export const formatDuration = (minutes: number) => {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${mins}m`;
};
