import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ErrorHandler } from "@/utils/error-handler";
import { ApiError } from "@/types/api-errors";
import { ApiErrorData, ApiResponse, AuthResponse } from "./api";

class ApiClient {
	private client: AxiosInstance;
	private token: string | null = null;
	private tokenExpiry: number | null = null;
	private isAuthenticating = false;

	constructor() {
		this.client = axios.create({
			baseURL:
				process.env.NEXT_PUBLIC_API_BASE_URL ||
				"https://api.myagent.online/api",
			headers: {
				"Accept-Encoding": "gzip",
				"Content-Type": "application/json",
			},
			timeout: 30000, // 30 second timeout
		});

		// Request interceptor for logging
		this.client.interceptors.request.use(
			config => {
				console.log(
					`API Request: ${config.method?.toUpperCase()} ${config.url}`
				);
				return config;
			},
			error => {
				console.error("Request interceptor error:", error);
				return Promise.reject(error);
			}
		);

		// Response interceptor for error handling
		this.client.interceptors.response.use(
			response => {
				console.log(`API Response: ${response.status} ${response.config.url}`);
				return response;
			},
			error => {
				console.error("Response interceptor error:", error);

				if (error.response?.data) {
					const apiError = new Error(
						error.response.data.data?.message || "API Error"
					) as ApiError;
					apiError.code = error.response.data.code;
					apiError.pid = error.response.data.pid;
					apiError.originalMessage = error.message; // This should now work
					throw apiError;
				}

				// For network errors or other issues
				const networkError = new Error(
					error.message || "Network Error"
				) as ApiError;
				networkError.code = 7; // Internal server error code
				networkError.pid = "network-error";
				networkError.originalMessage = error.message;
				throw networkError;
			}
		);

		// Load token from localStorage on initialization
		this.loadTokenFromStorage();
	}

	/**
	 * Get a valid authentication token
	 */
	private async getValidToken(): Promise<string> {
		// If we have a valid token, return it
		if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
			return this.token;
		}

		// If already authenticating, wait for it to complete
		if (this.isAuthenticating) {
			return new Promise((resolve, reject) => {
				const checkToken = () => {
					if (!this.isAuthenticating) {
						if (this.token) {
							resolve(this.token);
						} else {
							reject(new Error("Authentication failed"));
						}
					} else {
						setTimeout(checkToken, 100);
					}
				};
				checkToken();
			});
		}

		// Authenticate and get new token
		return await this.authenticate();
	}

	/**
	 * Authenticate with the API and get a new token
	 */
	private async authenticate(): Promise<string> {
		if (this.isAuthenticating) {
			throw new Error("Authentication already in progress");
		}

		this.isAuthenticating = true;

		try {
			console.log("Authenticating with API...");

			const response = await this.client.post<ApiResponse<AuthResponse>>(
				"/user/login",
				{
					login: process.env.NEXT_PUBLIC_API_LOGIN,
					password: process.env.NEXT_PUBLIC_API_PASSWORD,
					lang: "en",
				}
			);

			if (response.data.success && response.data.data) {
				this.token = response.data.data.auth_token;
				this.tokenExpiry = Date.now() + 55 * 60 * 1000; // 55 minutes

				// Save to localStorage
				this.saveTokenToStorage();

				console.log("Authentication successful");
				return this.token;
			}

			throw new Error("Authentication failed - no token received");
		} catch (error) {
			console.error("Authentication error:", error);
			this.clearAuth();
			throw error;
		} finally {
			this.isAuthenticating = false;
		}
	}

	/**
	 * Extend token expiry time when successful request is made
	 */
	private extendToken(): void {
		if (this.token && this.tokenExpiry) {
			this.tokenExpiry = Date.now() + 55 * 60 * 1000; // Extend by 55 minutes
			this.saveTokenToStorage();
		}
	}

	/**
	 * Save token to localStorage
	 */
	private saveTokenToStorage(): void {
		if (typeof window !== "undefined" && this.token && this.tokenExpiry) {
			try {
				localStorage.setItem("myagent_token", this.token);
				localStorage.setItem(
					"myagent_token_expiry",
					this.tokenExpiry.toString()
				);
			} catch (error) {
				console.warn("Failed to save token to localStorage:", error);
			}
		}
	}

	/**
	 * Load token from localStorage
	 */
	private loadTokenFromStorage(): void {
		if (typeof window !== "undefined") {
			try {
				const token = localStorage.getItem("myagent_token");
				const expiry = localStorage.getItem("myagent_token_expiry");

				if (token && expiry) {
					const expiryTime = parseInt(expiry, 10);
					if (Date.now() < expiryTime) {
						this.token = token;
						this.tokenExpiry = expiryTime;
						console.log("Token loaded from localStorage");
					} else {
						// Token expired, clear storage
						this.clearTokenFromStorage();
					}
				}
			} catch (error) {
				console.warn("Failed to load token from localStorage:", error);
				this.clearTokenFromStorage();
			}
		}
	}

	/**
	 * Clear token from localStorage
	 */
	private clearTokenFromStorage(): void {
		if (typeof window !== "undefined") {
			try {
				localStorage.removeItem("myagent_token");
				localStorage.removeItem("myagent_token_expiry");
			} catch (error) {
				console.warn("Failed to clear token from localStorage:", error);
			}
		}
	}

	/**
	 * Clear authentication data
	 */
	public clearAuth(): void {
		this.token = null;
		this.tokenExpiry = null;
		this.isAuthenticating = false;
		this.clearTokenFromStorage();
		console.log("Authentication cleared");
	}

	/**
	 * Check if user is authenticated
	 */
	public isAuthenticated(): boolean {
		return !!(this.token && this.tokenExpiry && Date.now() < this.tokenExpiry);
	}

	/**
	 * Get current token (for debugging)
	 */
	public getCurrentToken(): string | null {
		return this.token;
	}

	/**
	 * Get token expiry time (for debugging)
	 */
	public getTokenExpiry(): number | null {
		return this.tokenExpiry;
	}

	/**
	 * Main request method
	 */
	async request<T>(
		endpoint: string,
		params: Record<string, any> = {},
		method: "GET" | "POST" = "GET",
		showErrorToast: boolean = true
	): Promise<ApiResponse<T>> {
		try {
			const token = await this.getValidToken();

			let config: any = {
				method,
				url: endpoint,
			};

			if (method === "GET") {
				config.params = { ...params, auth_key: token };
			} else {
				const formData = new URLSearchParams();
				Object.entries({ ...params, auth_key: token }).forEach(
					([key, value]) => {
						if (value !== null && value !== undefined) {
							formData.append(key, value.toString());
						}
					}
				);
				config.data = formData;
				config.headers = {
					"Content-Type": "application/x-www-form-urlencoded",
				};
			}

			const response: AxiosResponse<ApiResponse<T>> = await this.client.request(
				config
			);

			if (response.data.success) {
				this.extendToken();
				return response.data;
			}

			// Handle API errors - safely extract error message
			let errorMessage = "API Error";

			// Check if data has message property (for error responses)
			if (
				response.data.data &&
				typeof response.data.data === "object" &&
				"message" in response.data.data
			) {
				errorMessage =
					(response.data.data as ApiErrorData).message || errorMessage;
			} else if (response.data.message) {
				errorMessage = response.data.message;
			}

			const apiError = new Error(errorMessage) as ApiError;
			(apiError as any).code = response.data.code;
			apiError.pid = response.data.pid;

			if (showErrorToast) {
				ErrorHandler.handle(apiError, endpoint);
			}

			throw apiError;
		} catch (error) {
			// Handle auth errors specifically
			if (
				error instanceof Error &&
				"code" in error &&
				Number((error as any).code) === 9
			) {
				console.log("Authentication error detected, clearing auth");
				this.clearAuth();
				if (showErrorToast) {
					ErrorHandler.handleAuthError(error as ApiError);
				}
			}

			throw error;
		}
	}
	/**
	 * GET request helper
	 */
	async get<T>(
		endpoint: string,
		params: Record<string, any> = {},
		showErrorToast: boolean = true
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, params, "GET", showErrorToast);
	}

	/**
	 * POST request helper
	 */
	async post<T>(
		endpoint: string,
		data: Record<string, any> = {},
		showErrorToast: boolean = true
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, data, "POST", showErrorToast);
	}

	/**
	 * Raw request without authentication (for public endpoints)
	 */
	async requestRaw<T>(
		endpoint: string,
		config: any = {}
	): Promise<AxiosResponse<T>> {
		return this.client.request({
			url: endpoint,
			...config,
		});
	}
	/**
	 * Health check
	 */
	async healthCheck(): Promise<boolean> {
		try {
			const response = await this.client.get("/health", { timeout: 5000 });
			return response.status === 200;
		} catch (error) {
			console.warn("Health check failed:", error);
			return false;
		}
	}

	/**
	 * Force token refresh
	 */
	async refreshToken(): Promise<string> {
		this.clearAuth();
		return await this.authenticate();
	}

	/**
	 * Logout user
	 */
	async logout(): Promise<void> {
		try {
			if (this.token) {
				// Call logout endpoint if available
				await this.post("/user/logout", {}, false);
			}
		} catch (error) {
			console.warn("Logout API call failed:", error);
		} finally {
			this.clearAuth();
		}
	}
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export for testing or advanced usage
export { ApiClient };
