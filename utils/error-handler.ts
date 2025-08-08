// utils/error-handler.ts
import { ApiError, ApiErrorCode } from "@/types/api-errors";
import { getErrorInfo } from "@/lib/error-messages";
import { toast } from "sonner";

export class ErrorHandler {
	static handle(error: ApiError | Error, context?: string): void {
		if (this.isApiError(error)) {
			this.handleApiError(error, context);
		} else {
			this.handleGenericError(error, context);
		}
	}

	private static isApiError(error: Error): error is ApiError {
		return "code" in error && "pid" in error;
	}

	private static handleApiError(error: ApiError, context?: string): void {
		const errorInfo = getErrorInfo(error.code);
		const contextPrefix = context ? `${context}: ` : "";

		switch (errorInfo.severity) {
			case "critical":
				toast.error(`${contextPrefix}${errorInfo.userMessage}`, {
					description: `Error ${error.code} • ID: ${error.pid}`,
					duration: 10000,
					action: this.getErrorAction(error.code, errorInfo.action),
				});
				break;

			case "high":
				toast.error(`${contextPrefix}${errorInfo.userMessage}`, {
					description: `Error ${error.code}`,
					duration: 8000,
					action: this.getErrorAction(error.code, errorInfo.action),
				});
				break;

			case "medium":
				toast.warning(`${contextPrefix}${errorInfo.userMessage}`, {
					description: `Error ${error.code}`,
					duration: 6000,
					action: this.getErrorAction(error.code, errorInfo.action),
				});
				break;

			case "low":
				toast.info(`${contextPrefix}${errorInfo.userMessage}`, {
					description: `Error ${error.code}`,
					duration: 4000,
				});
				break;

			default:
				toast.error(`${contextPrefix}${errorInfo.userMessage}`, {
					description: `Error ${error.code}`,
					duration: 6000,
				});
		}

		// Log error for debugging
		console.error("API Error:", {
			code: error.code,
			pid: error.pid,
			message: error.message,
			context,
		});
	}

	private static handleGenericError(error: Error, context?: string): void {
		const contextPrefix = context ? `${context}: ` : "";

		toast.error(`${contextPrefix}Something went wrong`, {
			description: error.message,
			duration: 6000,
			action: {
				label: "Contact Support",
				onClick: () => this.contactSupport(error.message),
			},
		});

		console.error("Generic Error:", { error, context });
	}

	private static getErrorAction(code: ApiErrorCode, action?: string) {
		switch (action) {
			case "retry":
				return {
					label: "Try Again",
					onClick: () => window.location.reload(),
				};

			case "redirect":
				return {
					label: "Login",
					onClick: () => (window.location.href = "/login"),
				};

			case "contact_support":
				return {
					label: "Contact Support",
					onClick: () => this.contactSupport(`Error ${code}`),
				};

			default:
				return undefined;
		}
	}

	private static contactSupport(errorInfo: string): void {
		// Open support email or chat
		const subject = encodeURIComponent(`Support Request - ${errorInfo}`);
		const body = encodeURIComponent(
			`Please describe the issue you encountered:\n\n${errorInfo}`
		);
		window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
	}

	// Specific error type handlers
	static handleAuthError(error: ApiError): void {
		toast.error("Authentication required", {
			description: "Please log in to continue",
			action: {
				label: "Login",
				onClick: () => (window.location.href = "/login"),
			},
		});
	}

	static handleValidationError(error: ApiError, fieldName?: string): void {
		const errorInfo = getErrorInfo(error.code);
		const field = fieldName ? ` (${fieldName})` : "";

		toast.warning(`Validation Error${field}`, {
			description: errorInfo.userMessage,
			duration: 5000,
		});
	}

	static handleBookingError(error: ApiError): void {
		const errorInfo = getErrorInfo(error.code);

		toast.error("Booking Error", {
			description: errorInfo.userMessage,
			duration: 8000,
			action:
				errorInfo.action === "retry"
					? {
							label: "Search Again",
							onClick: () => (window.location.href = "/search"),
					  }
					: undefined,
		});
	}

	static handlePaymentError(error: ApiError): void {
		const errorInfo = getErrorInfo(error.code);

		toast.error("Payment Error", {
			description: errorInfo.userMessage,
			duration: 10000,
			action: {
				label: "Review Payment",
				onClick: () => (window.location.href = "/payment"),
			},
		});
	}

	// Success messages
	static showSuccess(message: string, description?: string): void {
		toast.success(message, {
			description,
			duration: 4000,
		});
	}

	// Loading states
	static showLoading(message: string): string | number {
		return toast.loading(message);
	}

	static dismissLoading(toastId: string | number): void {
		toast.dismiss(toastId);
	}
}
