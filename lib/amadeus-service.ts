import {
	AmadeusLocation,
	AmadeusLocationResponse,
	AmadeusTokenResponse,
	FlightDestination,
	FlightDestinationsResponse,
} from "@/types/amadeus/amadeus-service";

class AmadeusService {
	private baseUrl: string;
	private clientId: string;
	private clientSecret: string;

	constructor() {
		console.log("Environment variables:", {
			clientId: process.env.NEXT_PUBLIC_AMADEUS_CLIENT_ID
				? "Present"
				: "Missing",
			clientSecret: process.env.NEXT_PUBLIC_AMADEUS_CLIENT_SECRET
				? "Present"
				: "Missing",
			baseUrl: process.env.NEXT_PUBLIC_AMADEUS_BASE_URL || "Using default",
		});

		this.baseUrl =
			process.env.NEXT_PUBLIC_AMADEUS_BASE_URL ||
			"https://test.api.amadeus.com";
		this.clientId = process.env.NEXT_PUBLIC_AMADEUS_CLIENT_ID || "";
		this.clientSecret = process.env.NEXT_PUBLIC_AMADEUS_CLIENT_SECRET || "";

		if (!this.clientId || !this.clientSecret) {
			throw new Error(
				"Amadeus client ID and secret must be set in environment variables."
			);
		}
	}

	// Get access token
	async getAccessToken(): Promise<AmadeusTokenResponse> {
		try {
			const res = await fetch(`${this.baseUrl}/v1/security/oauth2/token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					grant_type: "client_credentials",
					client_id: this.clientId,
					client_secret: this.clientSecret,
				}),
			});

			if (!res.ok) {
				throw new Error(`Failed to fetch access token: ${res.statusText}`);
			}
			const data = await res.json();
			console.log(
				"Token obtained successfully, expires in:",
				data.expires_in,
				"seconds"
			);
			return data;
		} catch (error) {
			console.error("Error getting access token:", error);
			throw error;
		}
	}

	// Search locations (airports/cities)
	async searchLocations(
		keyword: string,
		countryCode?: string,
		accessToken?: string
	): Promise<AmadeusLocation[]> {
		if (!accessToken) {
			throw new Error("Access token is required");
		}

		const params = new URLSearchParams({
			subType: "CITY,AIRPORT",
			keyword: keyword,
		});

		if (countryCode) {
			params.append("countryCode", countryCode);
		}

		try {
			const response = await fetch(
				`${this.baseUrl}/v1/reference-data/locations?${params.toString()}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(
					`Location search failed: ${response.status} ${response.statusText}`
				);
			}

			const data: AmadeusLocationResponse = await response.json();
			return data.data || [];
		} catch (error) {
			console.error("Error searching locations:", error);
			throw error;
		}
	}

	// Get flight destinations
	async getFlightDestinations(
		origin: string,
		maxPrice?: number,
		accessToken?: string
	): Promise<FlightDestination[]> {
		if (!accessToken) {
			throw new Error("Access token is required");
		}

		const params = new URLSearchParams({
			origin: origin,
		});

		if (maxPrice) {
			params.append("maxPrice", maxPrice.toString());
		}

		try {
			const response = await fetch(
				`${this.baseUrl}/v1/shopping/flight-destinations?${params.toString()}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(
					`Flight destinations request failed: ${response.status} ${response.statusText}`
				);
			}

			const data: FlightDestinationsResponse = await response.json();
			return data.data || [];
		} catch (error) {
			console.error("Error getting flight destinations:", error);
			throw error;
		}
	}
}

export const amadeusService = new AmadeusService();
export type { AmadeusLocation, FlightDestination, AmadeusTokenResponse };
