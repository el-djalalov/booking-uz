// app/api/airports/route.ts
import { NextResponse } from "next/server";
import { searchAirports } from "@/lib/airport-service";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q");

	if (!query) {
		return NextResponse.json(
			{ error: "Query parameter 'q' is required" },
			{ status: 400 }
		);
	}

	try {
		const results = await searchAirports(query);

		// Enhanced response with additional headers
		return NextResponse.json(results, {
			status: 200,
			headers: {
				// These will be combined with next.config.js headers
				"Content-Type": "application/json",
				"X-API-Version": "1.0",
				"X-Response-Time": Date.now().toString(),
			},
		});
	} catch (error) {
		console.error("Airport search API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch airport data" },
			{
				status: 500,
				headers: {
					"X-Error-Type": "AIRPORT_SEARCH_FAILED",
				},
			}
		);
	}
}

export async function OPTIONS(request: Request) {
	return new Response(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}
