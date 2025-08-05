// components/amadeus-airport-autocomplete.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { MapPin, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAmadeusLocationSearch } from "@/hooks/use-locations-search";
import { Airport } from "@/lib/airport-service";
import { cn } from "@/lib/utils";

interface AmadeusAirportAutocompleteProps {
	id: string;
	label: string;
	placeholder: string;
	value?: Airport | null;
	onSelect: (airport: Airport | null) => void;
	className?: string;
	countryCode?: string;
}

export const AmadeusAirportAutocomplete = ({
	id,
	label,
	placeholder,
	value,
	onSelect,
	className,
	countryCode,
}: AmadeusAirportAutocompleteProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [inputValue, setInputValue] = useState(
		value ? `${value.city} (${value.iata})` : ""
	);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const {
		searchResults,
		searchQuery,
		debouncedSearchQuery,
		setSearchQuery,
		setCountryCode,
		isLoading,
		isFetching,
		error,
	} = useAmadeusLocationSearch();

	useEffect(() => {
		if (countryCode) {
			setCountryCode(countryCode);
		}
	}, [countryCode, setCountryCode]);

	useEffect(() => {
		if (value) {
			setInputValue(`${value.city} (${value.iata})`);
		}
	}, [value]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				!inputRef.current?.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setInputValue(newValue);
		setSearchQuery(newValue);

		// Show dropdown if user has typed at least 1 character
		setIsOpen(newValue.length >= 1);

		if (newValue === "") {
			onSelect(null);
		}
	};

	const handleSelectAirport = (airport: Airport) => {
		setInputValue(`${airport.city} (${airport.iata})`);
		onSelect(airport);
		setIsOpen(false);
		setSearchQuery("");
	};

	// Show loading when user has typed 3+ characters and we're fetching
	const showSearching = searchQuery.length >= 3 && isFetching;

	// Show minimum characters message
	const showMinCharMessage =
		isOpen && searchQuery.length > 0 && searchQuery.length < 3;

	// Show results when we have them and query is long enough
	const showResults =
		isOpen && searchResults.length > 0 && debouncedSearchQuery.length >= 3;

	// Show no results message
	const showNoResults =
		isOpen &&
		searchResults.length === 0 &&
		debouncedSearchQuery.length >= 3 &&
		!isFetching &&
		!error;

	return (
		<div className={cn("relative", className)}>
			<Label htmlFor={id} className="text-sm font-medium mb-2 ml-4 block">
				{label}
			</Label>
			<div className="relative">
				<MapPin className="absolute left-3 top-4 h-4 w-4 text-muted-foreground z-10" />
				<Input
					ref={inputRef}
					id={id}
					value={inputValue}
					onChange={handleInputChange}
					onFocus={() => inputValue.length >= 1 && setIsOpen(true)}
					placeholder={placeholder}
					className="pl-10 pr-10 h-12 bg-white/80 border-slate focus:ring-primary"
					autoComplete="off"
				/>

				{/* Show different icons based on state */}
				{showSearching && (
					<Loader2 className="absolute right-3 top-4 h-4 w-4 animate-spin text-blue-500" />
				)}
				{!showSearching && searchQuery.length >= 3 && (
					<Search className="absolute right-3 top-4 h-4 w-4 text-gray-400" />
				)}
			</div>

			{/* Helper text */}
			{searchQuery.length > 0 && searchQuery.length < 3 && (
				<div className="text-xs text-gray-500 mt-1 ml-1">
					Type at least 3 characters to search
				</div>
			)}

			{/* Error message */}
			{error && (
				<div className="text-red-500 text-xs mt-1 ml-1">
					Search temporarily unavailable
				</div>
			)}

			{/* Minimum characters message */}
			{showMinCharMessage && (
				<div
					ref={dropdownRef}
					className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
				>
					<div className="text-gray-500 text-center flex items-center justify-center gap-2">
						<Search className="h-4 w-4" />
						Type at least 3 characters to search airports
					</div>
				</div>
			)}

			{/* Searching indicator */}
			{showSearching && (
				<div
					ref={dropdownRef}
					className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
				>
					<div className="text-blue-600 text-center flex items-center justify-center gap-2">
						<Loader2 className="h-4 w-4 animate-spin" />
						Searching airports for "{debouncedSearchQuery}"...
					</div>
				</div>
			)}

			{/* Results dropdown */}
			{showResults && (
				<div
					ref={dropdownRef}
					className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
				>
					{searchResults.map((airport, index) => (
						<div
							key={`${airport.iata}-${index}`}
							onClick={() => handleSelectAirport(airport)}
							className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
						>
							<div className="flex items-center justify-between">
								<div>
									<div className="font-medium text-gray-900">
										{airport.city}
									</div>
									<div className="text-sm text-gray-500 truncate">
										{airport.name}
									</div>
									<div className="text-xs text-gray-400">{airport.country}</div>
								</div>
								<div className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
									{airport.iata}
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* No results */}
			{showNoResults && (
				<div
					ref={dropdownRef}
					className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
				>
					<div className="text-gray-500 text-center">
						No airports found for "{debouncedSearchQuery}"
					</div>
				</div>
			)}
		</div>
	);
};
