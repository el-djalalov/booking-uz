"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000 * 2,
						gcTime: 10 * 60 * 1000,
						retry: (failureCount, error: any) => {
							if (error?.status >= 400 && error?.status < 500) return false;
							return failureCount < 3;
						},
						retryDelay: attemptIndex =>
							Math.min(1000 * 2 ** attemptIndex, 30000),
						// Disable automatic refetching during SSR
						refetchOnWindowFocus: false,
						refetchOnMount: false,
						refetchOnReconnect: false,
					},
					mutations: {
						// Optimized mutation settings
						retry: false,
						gcTime: 1000 * 60 * 5,
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{process.env.NODE_ENV === "development" && (
				<ReactQueryDevtools initialIsOpen={false} />
			)}
		</QueryClientProvider>
	);
}
