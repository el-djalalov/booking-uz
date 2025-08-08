"use client";

import * as React from "react";
import {
	ThemeProvider as NextThemesProvider,
	ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div suppressHydrationWarning>{children}</div>;
	}

	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
