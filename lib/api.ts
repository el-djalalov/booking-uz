export interface ApiResponse<T = any> {
	success: boolean;
	code: number;
	pid: string;
	data?: T;
	message?: string;
}

// Specific type for error responses
export interface ApiErrorData {
	message?: string;
	details?: any;
}

// Union type for responses that can contain errors
export interface ApiResponseWithError<T = any> {
	success: boolean;
	code: number;
	pid: string;
	data?: T | ApiErrorData;
	message?: string;
}

export interface AuthResponse {
	auth_token: string;
	expires_in?: number;
	user?: {
		id: number;
		login: string;
		email?: string;
	};
}
