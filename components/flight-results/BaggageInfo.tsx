import React, { useMemo } from "react";
import {
	FlightRecommendation,
	FlightSearchSuccessResponse,
} from "@/types/flight-search";
import { Handbag, Luggage, Repeat, Undo2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { useSearchParams } from "next/navigation";
import AdditionalInfoModal from "./AdditionalInfoModal";
import { formatPrice } from "./utils";

interface BaggageInfoProps {
	flight: FlightRecommendation;
	apiData: FlightSearchSuccessResponse;
}
const BaggageInfo: React.FC<BaggageInfoProps> = ({ flight, apiData }) => {
	const searchParams = useSearchParams();

	const fareFamilyName = flight.fare_family_type?.toUpperCase() || "STANDARD";
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

	return (
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
								{fareFamilyDetails.checkedBaggage.includes("KG") ? "" : "KG"}
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
					<AdditionalInfoModal apiData={apiData} />
				</div>
			</div>
		</div>
	);
};

export default BaggageInfo;
