// stores/flight-search-store.ts
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
	searchData: FlightSearchFormData; // ✅ Always complete type
	recentSearches: FlightSearchFormData[];
	favoriteAirports: Airport[];

	setSearchData: (data: FlightSearchFormData) => void; // ✅ Require complete data
	updateSearchData: (data: Partial<FlightSearchFormData>) => void; // ✅ New method for partial updates
	addRecentSearch: (search: FlightSearchFormData) => void;
	addFavoriteAirport: (airport: Airport) => void;
	removeFavoriteAirport: (iata: string) => void;
	clearSearchData: () => void;
	clearRecentSearches: () => void;
	restoreFromUrl: (params: URLSearchParams) => Promise<void>;
}

// ✅ Ensure defaultSearchData matches FlightSearchFormData exactly
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

			setSearchData: (data: FlightSearchFormData) => set({ searchData: data }),

			// ✅ New method for partial updates
			updateSearchData: (data: Partial<FlightSearchFormData>) =>
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
					].slice(0, 5),
				})),

			addFavoriteAirport: airport =>
				set(state => ({
					favoriteAirports: state.favoriteAirports.find(
						a => a.iata === airport.iata
					)
						? state.favoriteAirports
						: [...state.favoriteAirports, airport].slice(0, 10),
				})),

			removeFavoriteAirport: iata =>
				set(state => ({
					favoriteAirports: state.favoriteAirports.filter(a => a.iata !== iata),
				})),

			clearSearchData: () => set({ searchData: defaultSearchData }),

			clearRecentSearches: () => set({ recentSearches: [] }),

			restoreFromUrl: async params => {
				const current = get().searchData;
				const updates: Partial<FlightSearchFormData> = {};

				const from = params.get("from");
				const to = params.get("to");

				if (from) {
					updates.fromAirport = {
						iata: from,
						name: params.get("fromName") || "",
						city: params.get("fromCity") || "",
						country: params.get("fromCountry") || "",
					};
				}

				if (to) {
					updates.toAirport = {
						iata: to,
						name: params.get("toName") || "",
						city: params.get("toCity") || "",
						country: params.get("toCountry") || "",
					};
				}

				const departure = params.get("departure");
				if (departure) updates.departureDate = departure;

				const returnDate = params.get("return");
				if (returnDate) updates.returnDate = returnDate;

				const adults = params.get("adults");
				const children = params.get("children");
				const infants = params.get("infants");

				if (adults || children || infants) {
					updates.passengers = {
						adults: parseInt(adults || "1"),
						children: parseInt(children || "0"),
						infants: parseInt(infants || "0"),
					};
				}

				const travelClass = params.get("class");
				if (travelClass) updates.travelClass = travelClass as any;

				const tripType = params.get("tripType");
				if (tripType) updates.tripType = tripType as any;

				const directOnly = params.get("directOnly");
				if (directOnly) updates.directOnly = directOnly === "true";

				// ✅ Create complete FlightSearchFormData
				const completeData: FlightSearchFormData = {
					...current,
					...updates,
				};

				set({ searchData: completeData });
			},
		}),
		{
			name: "flight-search-storage",
			storage: createJSONStorage(() => {
				if (typeof window !== "undefined") {
					return window.sessionStorage;
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
