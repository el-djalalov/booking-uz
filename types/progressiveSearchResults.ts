import { FlightSearchSuccessResponse } from "@/types/flight-search";

export interface ProgressiveFlightResultsProps {
	data: FlightSearchSuccessResponse;
	chunkSize?: number;
	renderDelay?: number;
	autoLoad?: boolean;
	showProgress?: boolean;
}
