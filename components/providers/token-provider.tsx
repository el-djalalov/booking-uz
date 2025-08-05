"use client";

import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";

interface TokenProviderProps {
	token: string;
	expiresIn: number;
	children: React.ReactNode;
}

export function TokenProvider({
	token,
	expiresIn,
	children,
}: TokenProviderProps) {
	useEffect(() => {
		apiClient.setToken(token, expiresIn);
	}, [token, expiresIn]);

	return <>{children}</>;
}
