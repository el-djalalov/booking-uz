"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Airport } from "@/types/shared";

const searchAirports = async (query: string): Promise<Airport[]> => {
	if (query.length < 2) return [];
	const { data } = await axios.get(`/api/airports?q=${query}`);
	return data;
};

interface AirportSearchProps {
	query: string;
	onSelect: (airport: Airport) => void;
	onClose?: () => void;
}

export function AirportSearch({
	query,
	onSelect,
	onClose,
}: AirportSearchProps) {
	const {
		data: searchResults = [],
		isLoading,
		isFetching,
		error,
	} = useQuery<Airport[]>({
		queryKey: ["airports", query],
		queryFn: () => searchAirports(query),
		enabled: query.length >= 2,
	});

	const handleSelect = (airport: Airport) => {
		onSelect(airport);
		onClose?.();
	};

	const hasResults = searchResults.length > 0;

	return (
		<div className="w-96 max-w-3xl bg-white dark:bg-neutral-900/80 dark:backdrop-blur-xl border border-neutral/20 rounded-xl shadow-2xl ">
			{/* Results Container */}
			<div className="max-h-64 overflow-y-auto">
				{error && (
					<div className="p-3 bg-red-50 border-red-200">
						<p className="text-red-700 text-sm">
							Failed to search locations. Please try again.
						</p>
					</div>
				)}

				{/* Loading State */}
				{isFetching && (
					<div className="p-3 text-center">
						<div className="flex items-center justify-center gap-2">
							<div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
							<span className="text-sm text-gray-500">
								Searching airports...
							</span>
						</div>
					</div>
				)}

				{hasResults && (
					<div className="p-2">
						<div className="space-y-1">
							{searchResults.map(airport => (
								<Button
									key={airport.iata}
									variant="ghost"
									className="w-full justify-start text-left h-auto p-3 dark:hover:bg-neutral-900/80"
									onClick={() => handleSelect(airport)}
								>
									<div className="flex items-center justify-between w-full">
										<div className="flex items-center gap-3">
											<MapPin className="h-4 w-4 text-slate-400" />
											<div>
												<div className="text-sm font-semibold">
													{airport.name}
												</div>
												<div className="text-xs text-muted-foreground font-semibold">
													{airport.city}, {airport.country}
												</div>
											</div>
										</div>
										<Badge
											variant="secondary"
											className="ml-2 dark:bg-neutral-700 bg-slate-200"
										>
											{airport.iata}
										</Badge>
									</div>
								</Button>
							))}
						</div>
					</div>
				)}

				{query.length >= 2 && !isLoading && !isFetching && !hasResults && (
					<div className="text-center py-8 px-3">
						<p className="text-muted-foreground text-sm">
							No locations found for "{query}"
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Try searching for a city name or airport code
						</p>
					</div>
				)}

				{query.length > 0 && query.length < 2 && (
					<div className="p-3">
						<p className="text-muted-foreground text-sm text-center">
							Type at least 2 characters to search...
						</p>
					</div>
				)}

				{query.length === 0 && (
					<div className="p-3">
						<p className="text-muted-foreground text-sm text-center">
							Start typing to search for airports...
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
