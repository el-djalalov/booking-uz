// hooks/use-amadeus-token.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { amadeusService, AmadeusTokenResponse } from "@/lib/amadeus-service";
import { useEffect } from "react";

const TOKEN_REFRESH_BUFFER = 2 * 60 * 1000; // Refresh 2 minutes before expiry

export const useAmadeusToken = () => {
	const queryClient = useQueryClient();

	const {
		data: tokenData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["amadeus-token"],
		queryFn: async (): Promise<AmadeusTokenResponse> => {
			console.log("Fetching new Amadeus token...");
			return await amadeusService.getAccessToken();
		},
		staleTime: 25 * 60 * 1000, // Consider stale after 25 minutes (5 min buffer)
		gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		retry: 3,
		retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
	});

	// Set up automatic token refresh
	useEffect(() => {
		if (!tokenData) return;

		const expiresIn = tokenData.expires_in * 1000; // Convert to milliseconds
		const refreshTime = expiresIn - TOKEN_REFRESH_BUFFER;

		console.log(`Token will be refreshed in ${refreshTime / 1000} seconds`);

		const timeoutId = setTimeout(() => {
			console.log("Auto-refreshing Amadeus token...");
			queryClient.invalidateQueries({ queryKey: ["amadeus-token"] });
			refetch();
		}, refreshTime);

		return () => clearTimeout(timeoutId);
	}, [tokenData, queryClient, refetch]);

	return {
		accessToken: tokenData?.access_token,
		tokenType: tokenData?.token_type,
		expiresIn: tokenData?.expires_in,
		isLoading,
		error,
		refetch,
	};
};
