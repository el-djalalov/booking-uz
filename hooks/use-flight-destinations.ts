// hooks/use-flight-destinations.ts
import { useQuery } from "@tanstack/react-query";
import { amadeusService, FlightDestination } from "@/lib/amadeus-service";
import { useAmadeusToken } from "./use-amadeus-token";

export const useFlightDestinations = (origin: string, maxPrice?: number) => {
	const { accessToken, isLoading: tokenLoading } = useAmadeusToken();

	const shouldFetch = Boolean(accessToken && origin && origin.length === 3);

	const {
		data: destinations = [],
		isLoading: destinationsLoading,
		error,
	} = useQuery({
		queryKey: ["flight-destinations", origin, maxPrice],
		queryFn: async (): Promise<FlightDestination[]> => {
			if (!accessToken) {
				throw new Error("No access token available");
			}
			return await amadeusService.getFlightDestinations(
				origin,
				maxPrice,
				accessToken
			);
		},
		enabled: shouldFetch,
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});

	return {
		destinations,
		isLoading: tokenLoading || destinationsLoading,
		error,
	};
};
