"use server";

import { apiServerClient } from "@/lib/api-server-client";
import {
	FlightSearchParams,
	FlightRecommendation,
} from "@/types/flight-search";
import { revalidatePath, unstable_cache } from "next/cache";

export interface SearchRecommendationsResponse {
	success: boolean;
	data?: FlightRecommendation[];
	message?: string;
	error?: string;
	errorCode?: string;
	canRetry?: boolean;
	retryDelay?: number;
}

const cachedSearchSummary = unstable_cache(
	async (params: FlightSearchParams) => {
		const cacheKey = JSON.stringify(params);
		return {
			searchKey: cacheKey,
			timestamp: Date.now(),
		};
	},
	["flight-search-summary"],
	{
		revalidate: 300, // 5 minutes
		tags: ["flight-search-summary"],
	}
);

export async function searchRecommendations(
	params: FlightSearchParams
): Promise<SearchRecommendationsResponse> {
	try {
		console.log(
			"🔍 Searching flights with params:",
			JSON.stringify(params, null, 2)
		);

		// Direct API call without caching large responses
		const response = await apiServerClient.get<FlightRecommendation[]>(
			"/avia/search-recommendations",
			{
				...params,
				// Convert boolean to number for API provider
				is_direct_only: params.is_direct_only ? 1 : 0,
				lang: params.lang || "en",
			}
		);

		console.log(
			`✅ API Response: { success: ${response.success}, dataLength: ${
				response.data?.length || 0
			}, message: ${response.message || "undefined"} }`
		);

		if (!response.success) {
			return {
				success: false,
				error: response.message || "Failed to search flights",
				retryDelay: 5000,
			};
		}

		await cachedSearchSummary(params);

		return {
			success: true,
			data: response.data || [],
			message: response.message,
		};
	} catch (error) {
		console.error("❌ Search recommendations error:", error);

		if (error instanceof Error) {
			if (error.message.includes("timeout")) {
				return {
					success: false,
					error: "Search request timed out. Please try again.",
					errorCode: "TIMEOUT",
					canRetry: true,
					retryDelay: 3000,
				};
			}

			if (error.message.includes("network")) {
				return {
					success: false,
					error: "Network error. Please check your connection.",
					errorCode: "NETWORK_ERROR",
					canRetry: true,
					retryDelay: 5000,
				};
			}
		}

		return {
			success: false,
			error: "An unexpected error occurred while searching for flights",
			errorCode: "UNKNOWN_ERROR",
			canRetry: true,
			retryDelay: 3000,
		};
	}
}

export async function invalidateFlightSearchCache() {
	"use server";
	revalidatePath("/", "layout");
}
