import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/utils/providers/theme-provider";
import { QueryProvider } from "@/utils/providers/query-provider";
import { TokenProvider } from "@/utils/providers/token-provider";
import { getAuthToken } from "@/lib/server-auth";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "SafariX",
	description: "Cheapest tickets in town",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const token = await getAuthToken();
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<QueryProvider>
					<TokenProvider token={token} expiresIn={3300}>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							{children}
						</ThemeProvider>
					</TokenProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
