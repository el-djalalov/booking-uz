import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { FlightSearchFormData } from "@/lib/schema/flight-search";

interface Airport {
	iata: string;
	name: string;
	city: string;
	country: string;
}

interface FlightSearchStore {
	// Form data
	searchData: FlightSearchFormData;

	// UI state that should persist
	recentSearches: FlightSearchFormData[];
	favoriteAirports: Airport[];

	// Actions
	setSearchData: (data: Partial<FlightSearchFormData>) => void;
	addRecentSearch: (search: FlightSearchFormData) => void;
	addFavoriteAirport: (airport: Airport) => void;
	clearSearchData: () => void;
	restoreFromUrl: (params: URLSearchParams) => void;
}

const defaultSearchData: FlightSearchFormData = {
	tripType: "roundtrip",
	fromAirport: null,
	toAirport: null,
	departureDate: "",
	returnDate: undefined,
	passengers: {
		adults: 1,
		children: 0,
		infants: 0,
	},
	travelClass: "e",
	directOnly: false,
};

export const useFlightSearchStore = create<FlightSearchStore>()(
	persist(
		(set, get) => ({
			searchData: defaultSearchData,
			recentSearches: [],
			favoriteAirports: [],

			setSearchData: data =>
				set(state => ({
					searchData: { ...state.searchData, ...data },
				})),

			addRecentSearch: search =>
				set(state => ({
					recentSearches: [
						search,
						...state.recentSearches.filter(
							s =>
								s.fromAirport?.iata !== search.fromAirport?.iata ||
								s.toAirport?.iata !== search.toAirport?.iata ||
								s.departureDate !== search.departureDate
						),
					].slice(0, 5), // Keep only last 5 searches
				})),

			addFavoriteAirport: airport =>
				set(state => ({
					favoriteAirports: state.favoriteAirports.find(
						a => a.iata === airport.iata
					)
						? state.favoriteAirports
						: [...state.favoriteAirports, airport].slice(0, 10),
				})),

			clearSearchData: () => set({ searchData: defaultSearchData }),

			// ✅ Restore form data from URL parameters
			restoreFromUrl: params => {
				const searchData: Partial<FlightSearchFormData> = {};

				const from = params.get("from");
				const to = params.get("to");

				if (from) {
					// You might want to fetch full airport data from your API
					searchData.fromAirport = {
						iata: from,
						name: "",
						city: "",
						country: "",
					};
				}

				if (to) {
					searchData.toAirport = { iata: to, name: "", city: "", country: "" };
				}

				const departure = params.get("departure");
				if (departure) searchData.departureDate = departure;

				const returnDate = params.get("return");
				if (returnDate) searchData.returnDate = returnDate;

				const adults = params.get("adults");
				const children = params.get("children");
				const infants = params.get("infants");

				if (adults || children || infants) {
					searchData.passengers = {
						adults: parseInt(adults || "1"),
						children: parseInt(children || "0"),
						infants: parseInt(infants || "0"),
					};
				}

				const travelClass = params.get("class");
				if (travelClass) searchData.travelClass = travelClass as any;

				const tripType = params.get("tripType");
				if (tripType) searchData.tripType = tripType as any;

				const directOnly = params.get("directOnly");
				if (directOnly) searchData.directOnly = directOnly === "true";

				set(state => ({
					searchData: { ...state.searchData, ...searchData },
				}));
			},
		}),
		{
			name: "flight-search-storage",
			storage: createJSONStorage(() => {
				// Use sessionStorage for temporary persistence
				// Use localStorage if you want data to persist across browser sessions
				if (typeof window !== "undefined") {
					return window.sessionStorage; // or window.localStorage
				}
				return {
					getItem: () => null,
					setItem: () => {},
					removeItem: () => {},
				};
			}),
			partialize: state => ({
				searchData: state.searchData,
				recentSearches: state.recentSearches,
				favoriteAirports: state.favoriteAirports,
			}),
		}
	)
);
