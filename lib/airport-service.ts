import axios from "axios";

export interface Airport {
	iata: string;
	name: string;
	city: string;
	country: string;
	latitude?: number;
	longitude?: number;
}

// Free airport data from GitHub (static data)
const AIRPORTS_JSON_URL =
	"https://raw.githubusercontent.com/jbrooksuk/JSON-Airports/master/airports.json";

// Alternative: Use local airports.json file for better performance
export const fetchAirports = async (): Promise<Airport[]> => {
	try {
		const response = await axios.get(AIRPORTS_JSON_URL);

		// Filter out invalid entries and map to our Airport interface
		return response.data
			.filter(
				(airport: any) =>
					airport &&
					(airport.iata || airport.code) &&
					airport.name &&
					airport.city &&
					airport.country
			)
			.map((airport: any) => ({
				iata: airport.iata || airport.code || "",
				name: airport.name || "",
				city: airport.city || "",
				country: airport.country || "",
				latitude: airport.lat || airport.latitude,
				longitude: airport.lon || airport.longitude,
			}))
			.filter(
				(airport: Airport) =>
					airport.iata && airport.name && airport.city && airport.country
			);
	} catch (error) {
		console.error("Error fetching airports:", error);
		return [];
	}
};

// Search airports by query with null checks
// lib/airport-service.ts
export const searchAirports = (
	airports: Airport[],
	query: string
): Airport[] => {
	console.log("Search query:", query);
	console.log("Airports available:", airports.length);
	console.log("First few airports:", airports.slice(0, 3));

	if (!query || query.length < 2) return [];
	if (!airports || !Array.isArray(airports)) return [];

	const searchTerm = query.toLowerCase().trim();
	console.log("Search term:", searchTerm);

	const results = airports
		.filter(airport => {
			try {
				if (!airport || typeof airport !== "object") return false;

				const city = (airport.city || "").toLowerCase();
				const name = (airport.name || "").toLowerCase();
				const iata = (airport.iata || "").toLowerCase();
				const country = (airport.country || "").toLowerCase();

				const matches =
					city.includes(searchTerm) ||
					name.includes(searchTerm) ||
					iata.includes(searchTerm) ||
					country.includes(searchTerm);

				// Debug specific airport
				if (airport.iata === "DXB") {
					console.log("DXB airport check:", {
						city,
						name,
						iata,
						country,
						searchTerm,
						matches,
					});
				}

				return matches;
			} catch (error) {
				console.error("Error filtering airport:", airport, error);
				return false;
			}
		})
		.slice(0, 10);

	console.log("Search results:", results);
	return results;
};
