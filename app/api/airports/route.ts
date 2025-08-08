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
		return NextResponse.json(results);
	} catch (error) {
		console.error("Airport search API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch airport data" },
			{ status: 500 }
		);
	}
}
