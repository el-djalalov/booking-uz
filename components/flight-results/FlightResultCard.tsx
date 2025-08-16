"use client";

import React, { useState } from "react";
import {
	FlightRecommendation,
	FlightSearchSuccessResponse,
} from "@/types/flight-search";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import FlightCardHeader from "./FlightCardHeader";
import BaggageInfo from "./BaggageInfo";
import FlightDetails from "./FlightDetails";

export const FlightCard = React.memo(
	({
		isNew = false,
		apiData,
		flight,
	}: {
		flight: FlightRecommendation;
		isNew?: boolean;
		apiData: FlightSearchSuccessResponse;
	}) => {
		const [isOpen, setIsOpen] = useState(false);
		const search = apiData.data.search;

		return (
			<Card
				className={`transition-all duration-300 py-0 shadow-lg ${
					isNew ? "animate-in slide-in-from-bottom-4 fade-in-0" : ""
				} bg-card text-card-foreground`}
			>
				<Collapsible
					open={isOpen}
					onOpenChange={setIsOpen}
					className="transition-all duration-300"
				>
					<CardHeader className="px-4">
						<FlightCardHeader flight={flight} search={search} isOpen={isOpen} />
					</CardHeader>

					<CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open] animate-collapsible-down transition-all duration-300 ease-in-out">
						<CardContent className="p-2 bg-accent dark:bg-blue-950/10 rounded-b-lg shadow-sm border-t-1 border-dashed border-muted-foreground/30">
							<div className="flex gap-2">
								<FlightDetails flight={flight} />
								<BaggageInfo flight={flight} apiData={apiData} />
							</div>
						</CardContent>
					</CollapsibleContent>
				</Collapsible>
			</Card>
		);
	}
);
