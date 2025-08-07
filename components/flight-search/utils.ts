import { format } from "date-fns";
import { CLASS_DISPLAY_NAMES } from "./constants";

export const formatDateDisplay = (
	departureDate: string,
	returnDate?: string,
	tripType?: string
) => {
	if (!departureDate) return null;

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

export const getClassDisplayName = (classCode: string) => {
	return (
		CLASS_DISPLAY_NAMES[classCode as keyof typeof CLASS_DISPLAY_NAMES] ||
		"Economy"
	);
};

export const getPassengerText = (passengers: {
	adults: number;
	children: number;
	infants: number;
}) => {
	const { adults, children, infants } = passengers;
	const total = adults + children + infants;

	if (total === 1 && adults === 1) return "1 Adult";

	const parts = [];
	if (adults) parts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
	if (children) parts.push(`${children} Child${children > 1 ? "ren" : ""}`);
	if (infants) parts.push(`${infants} Infant${infants > 1 ? "s" : ""}`);

	return parts.join(", ");
};
