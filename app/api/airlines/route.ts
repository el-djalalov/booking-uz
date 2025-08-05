import { NextResponse } from "next/server";
import { searchAirlines } from "@/lib/airline-service";

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
    const results = await searchAirlines(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Airline search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch airline data" },
      { status: 500 }
    );
  }
}
