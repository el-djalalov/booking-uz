import { useMemo } from "react";
import { FlightRecommendation } from "@/types/flight-search";

export interface FareFamily {
	name: string;
	price: number;
	checkedBaggage: string;
	handBaggage: {
		piece: number;
		weight: number;
		weightUnit: string;
		dimensions?: any;
	};
	refund: string;
	change: string;
}

const useFareFamilies = (flight: FlightRecommendation): FareFamily[] => {
	if (
		!flight ||
		!flight.price ||
		!flight.segments ||
		flight.segments.length === 0
	) {
		console.warn(
			"Missing essential flight data, returning empty fare families."
		);
		return [];
	}

	// Set fare_family_type to "standard" if it is an empty string
	let fareFamilyType = flight.fare_family_type || "standard";

	return useMemo<FareFamily[]>(() => {
		const fareTypeMap = {
			standard: {
				name: "STANDARD",
				defaultBaggagePieces: 1,
			},
			"semi flex": {
				name: "ECONOMY SEMI FLEX",
				defaultBaggagePieces: 1,
			},
			flexible: {
				name: "FLEXIBLE",
				defaultBaggagePieces: 2,
			},
			plus: {
				name: "ECONOMY FLEX PLUS",
				defaultBaggagePieces: 2,
			},
		};

		const matchedType = Object.keys(fareTypeMap).find(key =>
			fareFamilyType.toLowerCase().includes(key)
		);

		if (!matchedType) {
			console.warn("No match found for fare_family_type:", fareFamilyType);
			return []; // Returns empty array if no match found
		}

		const fareConfig = fareTypeMap[matchedType as keyof typeof fareTypeMap];

		return [
			{
				name: fareConfig.name,
				price: flight.price.RUB.amount,
				checkedBaggage: flight.segments[0].baggage
					? `${
							flight.segments[0].baggage.piece ||
							fareConfig.defaultBaggagePieces
					  } piece, ${flight.segments[0].baggage.weight || "N/A"} ${
							flight.segments[0].baggage.weight_unit || ""
					  }`.trim()
					: "No checked baggage",
				handBaggage: {
					piece: flight.segments[0].cbaggage?.piece || 1,
					weight: flight.segments[0].cbaggage?.weight || 8,
					weightUnit: flight.segments[0].cbaggage?.weight_unit || "KG",
					dimensions: flight.segments[0].cbaggage?.dimensions,
				},
				refund: getRefundStatus(flight),
				change: getChangeStatus(flight),
			},
		];
	}, [fareFamilyType, flight]);
};

// Helper functions for refund and change status
const getRefundStatus = (flight: FlightRecommendation): string => {
	return flight.is_refund
		? flight.segments[0].refundBlock?.beforeDeparture?.available
			? flight.segments[0].refundBlock.beforeDeparture.isFree
				? "Free refunds"
				: "Refundable with fee"
			: "Non-refundable"
		: "Non-refundable";
};

const getChangeStatus = (flight: FlightRecommendation): string => {
	return flight.is_change
		? flight.segments[0].exchangeBlock?.beforeDeparture?.available
			? flight.segments[0].exchangeBlock.beforeDeparture.isFree
				? "Free changes"
				: "Changeable with fee"
			: "Non-changeable"
		: "Non-changeable";
};

export default useFareFamilies;
