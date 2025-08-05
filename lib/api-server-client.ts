import "server-only";
import axios, { AxiosInstance } from "axios";
import { getAuthToken } from "./server-auth";
import { ApiResponse } from "./api";

class ApiServerClient {
	private client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL:
				process.env.NEXT_PUBLIC_API_BASE_URL ||
				"https://api.myagent.online/api",
			headers: {
				"Content-Type": "application/json",
				"Accept-Encoding": "gzip",
				"User-Agent": "MyAgentClient/1.0",
			},
			timeout: 30000,
		});

		this.client.interceptors.response.use(
			response => response,
			error => {
				console.error("API Server Client Error:", error.response?.data);
				return Promise.reject(error);
			}
		);
	}

	private async request<T>(
		endpoint: string,
		params: Record<string, any> = {},
		method: "GET" | "POST" = "GET"
	): Promise<ApiResponse<T>> {
		const token = await getAuthToken();

				const config: any = {
			method,
			url: endpoint,
			headers: { ...this.client.defaults.headers.common },
		};

		if (method === "GET") {
			config.params = { ...params, auth_key: token };
		} else if (method === "POST") {
			config.data = params;
			config.headers["auth_key"] = token;
		}

		const fullUrl = this.client.getUri(config);
		console.log(`Making API request to: ${fullUrl}`);

		const response = await this.client.request<ApiResponse<T>>(config);
		return response.data;
	}

	async get<T>(
		endpoint: string,
		params: Record<string, any> = {}
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, params, "GET");
	}

	async post<T>(
		endpoint: string,
		data: Record<string, any> = {}
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, data, "POST");
	}
}

export const apiServerClient = new ApiServerClient();