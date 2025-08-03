import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchAirports, searchAirports, Airport } from "@/lib/airport-service";

export const useAirportSearch = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const {
		data: airports = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["airports"],
		queryFn: fetchAirports,
		staleTime: 1000 * 60 * 60 * 24,
		gcTime: 1000 * 60 * 60 * 24,
	});

	const searchResults = useMemo(() => {
		return searchAirports(airports, searchQuery);
	}, [airports, searchQuery]);

	return {
		airports,
		searchResults,
		searchQuery,
		setSearchQuery,
		isLoading,
		error,
	};
};
