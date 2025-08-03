// hooks/use-amadeus-locations.ts
import { useQuery } from "@tanstack/react-query";
import { amadeusService, AmadeusLocation } from "@/lib/amadeus-service";
import { useAmadeusToken } from "./use-amadeus-token";
import { useMemo, useState } from "react";
import { useDebounce } from "./use-debounce";

export const useAmadeusLocationSearch = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [countryCode, setCountryCode] = useState<string>("");
	const { accessToken, isLoading: tokenLoading } = useAmadeusToken();

	// Debounce the search query - wait 500ms after user stops typing
	const debouncedSearchQuery = useDebounce(searchQuery, 500);

	// Only search when we have a token, query has at least 3 characters, and after debounce
	const shouldSearch = Boolean(
		accessToken && debouncedSearchQuery && debouncedSearchQuery.length >= 3
	);

	const {
		data: locations = [],
		isLoading: locationsLoading,
		error,
		isFetching,
	} = useQuery({
		queryKey: ["amadeus-locations", debouncedSearchQuery, countryCode],
		queryFn: async (): Promise<AmadeusLocation[]> => {
			if (!accessToken) {
				throw new Error("No access token available");
			}
			console.log("🔍 Searching locations for:", debouncedSearchQuery);
			return await amadeusService.searchLocations(
				debouncedSearchQuery,
				countryCode,
				accessToken
			);
		},
		enabled: shouldSearch,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});

	// Convert to our Airport interface for compatibility
	const searchResults = useMemo(() => {
		return locations.map(location => ({
			iata: location.iataCode,
			name: location.name,
			city: location.address?.cityName || location.name,
			country: location.address?.countryName || "",
			latitude: location.geoCode?.latitude,
			longitude: location.geoCode?.longitude,
		}));
	}, [locations]);

	return {
		searchResults,
		searchQuery,
		setSearchQuery,
		debouncedSearchQuery, // Expose this for debugging
		countryCode,
		setCountryCode,
		isLoading: tokenLoading || locationsLoading,
		isFetching, // Shows when actively fetching (useful for showing spinner)
		error,
		rawLocations: locations,
	};
};
