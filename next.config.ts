import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async headers() {
		return [
			// API Routes Security Headers
			{
				source: "/api/:path*",
				headers: [
					// CORS Configuration
					{
						key: "Access-Control-Allow-Origin",
						value:
							process.env.NODE_ENV === "production"
								? "*" //https://yourdomain.com
								: "*",
					},
					{
						key: "Access-Control-Allow-Methods",
						value: "GET, POST, OPTIONS",
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "Content-Type, Authorization",
					},
					// Cache Control for API responses
					{
						key: "Cache-Control",
						value: "public, s-maxage=300, stale-while-revalidate=600",
					},
					// Security Headers
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
				],
			},
			// Global Security Headers
			{
				source: "/:path*",
				headers: [
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "X-Frame-Options",
						value: "SAMEORIGIN",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
				],
			},
		];
	},
};

export default nextConfig;
