import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ErrorHandler } from "@/utils/error-handler";
import { ApiError } from "@/types/api-errors";
import { ApiErrorData, ApiResponse } from "@/types/api";

class ApiClient {
	private client: AxiosInstance;
	private token: string | null = null;
	private tokenExpiry: number | null = null;

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
					apiError.originalMessage = error.message;
					throw apiError;
				}

				const networkError = new Error(
					error.message || "Network Error"
				) as ApiError;
				networkError.code = 7;
				networkError.pid = "network-error";
				networkError.originalMessage = error.message;
				throw networkError;
			}
		);

		this.loadTokenFromStorage();
	}

	public setToken(token: string, expiresIn: number): void {
		this.token = token;
		this.tokenExpiry = Date.now() + expiresIn * 1000;
		this.saveTokenToStorage();
	}

	private getValidToken(): string {
		if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
			return this.token;
		}

		throw new Error("Client-side token is not valid");
	}

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
						this.clearTokenFromStorage();
					}
				}
			} catch (error) {
				console.warn("Failed to load token from localStorage:", error);
				this.clearTokenFromStorage();
			}
		}
	}

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

	public clearAuth(): void {
		this.token = null;
		this.tokenExpiry = null;
		this.clearTokenFromStorage();
		console.log("Authentication cleared");
	}

	public isAuthenticated(): boolean {
		return !!(this.token && this.tokenExpiry && Date.now() < this.tokenExpiry);
	}

	public getCurrentToken(): string | null {
		return this.token;
	}

	public getTokenExpiry(): number | null {
		return this.tokenExpiry;
	}

	async request<T>(
		endpoint: string,
		params: Record<string, any> = {},
		method: "GET" | "POST" = "GET",
		showErrorToast: boolean = true
	): Promise<ApiResponse<T>> {
		try {
			const token = this.getValidToken();

			let config: any = {
				method,
				url: endpoint,
			};

			if (method === "GET") {
				config.params = { ...params, auth_key: token };
			} else {
				config.data = { ...params, auth_key: token };
			}

			const response: AxiosResponse<ApiResponse<T>> = await this.client.request(
				config
			);

			if (response.data.success) {
				return response.data;
			}

			let errorMessage = "API Error";

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

	async get<T>(
		endpoint: string,
		params: Record<string, any> = {},
		showErrorToast: boolean = true
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, params, "GET", showErrorToast);
	}

	async post<T>(
		endpoint: string,
		data: Record<string, any> = {},
		showErrorToast: boolean = true
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, data, "POST", showErrorToast);
	}
}

export const apiClient = new ApiClient();
