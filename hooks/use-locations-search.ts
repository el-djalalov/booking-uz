import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useCallback, useMemo, useState } from "react";
import { useDebounce } from "./use-debounce";
import { LocationSearchResponse } from "@/types/location-search";
import { Airport } from "@/types/shared";

export const useLocationSearch = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [language, setLanguage] = useState<string>("en");

	// Debounce the search query - wait 500ms after user stops typing
	const debouncedSearchQuery = useDebounce(searchQuery, 500);

	// Only search when query has at least 2 characters
	const shouldSearch = Boolean(
		debouncedSearchQuery && debouncedSearchQuery.length >= 2
	);

	const {
		data: locationData,
		isLoading,
		error,
		isFetching,
	} = useQuery({
		queryKey: ["location-search", debouncedSearchQuery, language],
		queryFn: async (): Promise<LocationSearchResponse> => {
			console.log("🔍 Searching locations for:", debouncedSearchQuery);

			const params = {
				part: debouncedSearchQuery,
				lang: language,
			};

			const response = await apiClient.get<LocationSearchResponse>(
				"/avia/airports",
				params
			);

			if (response.data) {
				console.log(`✅ Successfully found locations`);
				return response.data;
			}

			throw new Error("No location data available");
		},
		enabled: shouldSearch,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});

	// Convert to standardized Airport interface
	const searchResults = useMemo((): Airport[] => {
		if (!locationData?.cities) return [];

		const results: Airport[] = [];

		// Process each city from the response
		Object.values(locationData.cities).forEach(city => {
			// Add the city itself as a searchable location
			results.push({
				iata: city.cityIataCode,
				name: city.cityName,
				city: city.cityName,
				country: city.countryName,
				countryCode: city.countryIataCode,
			});

			// Add individual airports if they exist
			if (city.airports && city.airports.length > 0) {
				city.airports.forEach(airport => {
					results.push({
						iata: airport.airportIataCode,
						name: airport.airportName,
						city: city.cityName,
						country: city.countryName,
						countryCode: city.countryIataCode,
					});
				});
			}
		});

		return results;
	}, [locationData]);

	// Separate airports and cities for convenience
	const airports = useMemo(() => {
		return searchResults.filter(
			location =>
				// Filter to only actual airports (not city codes)
				locationData?.cities &&
				Object.values(locationData.cities).some(city =>
					city.airports?.some(
						airport => airport.airportIataCode === location.iata
					)
				)
		);
	}, [searchResults, locationData]);

	const cities = useMemo(() => {
		return searchResults.filter(
			location =>
				// Filter to only city codes
				locationData?.cities &&
				Object.values(locationData.cities).some(
					city => city.cityIataCode === location.iata
				)
		);
	}, [searchResults, locationData]);

	return {
		// Results
		searchResults,
		airports,
		cities,

		// Search state
		searchQuery,
		setSearchQuery,
		debouncedSearchQuery,
		language,
		setLanguage,

		// Loading states
		isLoading,
		isFetching,
		error,

		// Raw data for debugging
		rawLocationData: locationData,

		// Helper methods
		clearSearch: () => setSearchQuery(""),
		hasResults: searchResults.length > 0,

		// Get specific city data
		getCityByCode: (iataCode: string) => {
			if (!locationData?.cities) return null;
			return (
				Object.values(locationData.cities).find(
					city => city.cityIataCode === iataCode
				) || null
			);
		},

		// Get specific city data
		getAirportsForCity: (cityIataCode: string): Airport[] => {
			if (!locationData?.cities) return [];
			const city = Object.values(locationData.cities).find(
				city => city.cityIataCode === cityIataCode
			);

			if (!city?.airports) return [];
			// Transform MyAgentAirport to Airport interface
			return city.airports.map(airport => ({
				iata: airport.airportIataCode,
				name: airport.airportName,
				city: city.cityName,
				country: city.countryName,
				countryCode: city.countryIataCode,
				type: "airport" as const,
			}));
		},
	};
};

// Hook for airline search
export const useAirlineSearch = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [language, setLanguage] = useState<string>("en");

	const debouncedSearchQuery = useDebounce(searchQuery, 500);

	const shouldSearch = Boolean(
		debouncedSearchQuery && debouncedSearchQuery.length >= 2
	);

	const {
		data: airlines = [],
		isLoading,
		error,
		isFetching,
	} = useQuery({
		queryKey: ["airline-search", debouncedSearchQuery, language],
		queryFn: async () => {
			console.log("🔍 Searching airlines for:", debouncedSearchQuery);

			const params = {
				part: debouncedSearchQuery,
				lang: language,
			};

			const response = await apiClient.get<
				{ name: string; code: string; name_en: string }[]
			>("/avia/airlines", params);

			return response.data || [];
		},
		enabled: shouldSearch,
		staleTime: 10 * 60 * 1000, // 10 minutes (airlines change less frequently)
		gcTime: 30 * 60 * 1000, // 30 minutes
	});

	return {
		airlines,
		searchQuery,
		setSearchQuery,
		debouncedSearchQuery,
		language,
		setLanguage,
		isLoading,
		isFetching,
		error,
		clearSearch: () => setSearchQuery(""),
		hasResults: airlines.length > 0,
	};
};
