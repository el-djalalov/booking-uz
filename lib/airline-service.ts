/* import { apiServerClient } from "./api-server-client";

export interface Airline {
	code: string;
	name: string;
}

interface AirlineApiResponse {
	data: {
		name: string;
		code: string;
		name_en: string;
	}[];
}

export async function searchAirlines(query: string): Promise<Airline[]> {
	if (!query || query.length < 2) {
		return [];
	}

	try {
		const response = await apiServerClient.get<AirlineApiResponse>(
			"/avia/airlines",
			{
				part: query,
				lang: "en",
			}
		);

		if (!response.success || !response.data) {
			console.error("Airline search API returned an error:", response.message);
			return [];
		}

		const res = response.data;

		return res.map(item => ({
			code: item.code,
			name: item.name_en || item.name, // Use English name if available, fallback to regular name
		}));
	} catch (error) {
		console.error("Error fetching airlines:", error);
		return [];
	}
}
 */
