import "server-only";
import axios from "axios";
import { ApiResponse, AuthResponse } from "@/types/api";

// Server-wide in-memory cache for the auth token
let tokenCache: {
	token: string | null;
	expiry: number | null;
} = {
	token: null,
	expiry: null,
};

let authPromise: Promise<string> | null = null;

/**
 * This function is responsible for authenticating with the API on the server-side.
 * It uses a server-wide in-memory cache to ensure that the login request is only
 * made when the token is missing or expired. It also handles concurrent requests
 * to prevent multiple login calls at the same time.
 */
export const getAuthToken = async (): Promise<string> => {
	if (tokenCache.token && tokenCache.expiry && Date.now() < tokenCache.expiry) {
		console.log("Using cached server-side auth token.");
		return tokenCache.token;
	}

	if (authPromise) {
		console.log("Waiting for in-progress server-side authentication...");
		return authPromise;
	}

	authPromise = (async () => {
		try {
			const response = await axios.post<ApiResponse<AuthResponse>>(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/login`,
				{
					login: process.env.NEXT_PUBLIC_API_LOGIN,
					password: process.env.NEXT_PUBLIC_API_PASSWORD,
					lang: "en",
				},
				{
					headers: {
						"Content-Type": "application/json",
						"Accept-Encoding": "gzip",
						"User-Agent": "MyAgentClient/1.0",
					},
					timeout: 15000,
				}
			);

			if (response.data.success && response.data.data?.auth_token) {
				const token = response.data.data.auth_token;
				tokenCache = {
					token: token,
					expiry: Date.now() + 55 * 60 * 1000, // 55 minutes
				};
				return token;
			}

			throw new Error(
				`Authentication failed: ${response.data.message || "No token received"}`
			);
		} catch (error) {
			tokenCache = { token: null, expiry: null }; // Clear cache on error
			if (axios.isAxiosError(error)) {
				console.error(
					"Axios error during server-side authentication:",
					error.response?.data || error.message
				);
			} else {
				console.error(
					"Unknown error during server-side authentication:",
					error
				);
			}
			throw new Error("Failed to authenticate on the server.");
		} finally {
			authPromise = null;
		}
	})();

	return authPromise;
};
