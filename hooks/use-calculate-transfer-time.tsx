import { useMemo } from "react";
import { FlightSegment } from "@/types/flight-search";

const formatDuration = (minutes: number) => {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${mins}m`;
};

const useTransferTime = (segment1: FlightSegment, segment2: FlightSegment) => {
	return useMemo(() => {
		try {
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
				return `${year}-${month}-${day}T${time}`;
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
	}, [segment1, segment2]);
};

export default useTransferTime;
