import { NextRequest, NextResponse } from "next/server";
import { searchRecommendations } from "@/app/actions/search-recommendations";
import { FlightSearchParams } from "@/types/flight-search";
import { z } from "zod";

// Input validation schema
const SearchRequestSchema = z.object({
	fromAirport: z.object({
		iata: z.string().min(3).max(3),
		name: z.string(),
		city: z.string(),
		country: z.string(),
	}),
	toAirport: z.object({
		iata: z.string().min(3).max(3),
		name: z.string(),
		city: z.string(),
		country: z.string(),
	}),
	departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	returnDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional()
		.or(z.literal("").transform(() => undefined))
		.or(z.null()),
	passengers: z.object({
		adults: z.number().min(1).max(9),
		children: z.number().min(0).max(9),
		infants: z.number().min(0).max(9),
	}),
	travelClass: z.enum(["e", "b", "f", "w"]),
	tripType: z.enum(["oneway", "roundtrip"]),
	directOnly: z.boolean().optional(),
	filterAirlines: z.array(z.string()).optional(),
	gdsWhiteList: z.array(z.number()).optional(),
	gdsBlackList: z.array(z.number()).optional(),
});

// Transform form data to API provider format
function transformToApiParams(
	data: z.infer<typeof SearchRequestSchema>
): FlightSearchParams {
	const segments = [
		{
			from: data.fromAirport.iata,
			to: data.toAirport.iata,
			date: formatDateForApi(data.departureDate),
		},
	];

	// Add return segment for round trips
	if (data.tripType === "roundtrip" && data.returnDate) {
		segments.push({
			from: data.toAirport.iata,
			to: data.fromAirport.iata,
			date: formatDateForApi(data.returnDate),
		});
	}

	return {
		adt: data.passengers.adults,
		chd: data.passengers.children,
		inf: data.passengers.infants,
		src: 0, // seniors - not used in your form
		yth: 0, // youth - not used in your form
		class: data.travelClass,
		segments,
		is_direct_only: data.directOnly || false,
		filter_airlines: data.filterAirlines,
		gds_white_list: data.gdsWhiteList,
		gds_black_list: data.gdsBlackList,
		lang: "en",
	};
}

// Format date from YYYY-MM-DD to DD.MM.YYYY (API provider format)
function formatDateForApi(dateString: string): string {
	const [year, month, day] = dateString.split("-");
	return `${day}.${month}.${year}`;
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate request body
		const validationResult = SearchRequestSchema.safeParse(body);
		if (!validationResult.success) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid request data",
					details: validationResult.error.issues,
				},
				{ status: 400 }
			);
		}

		const searchParams = transformToApiParams(validationResult.data);

		const result = await searchRecommendations(searchParams);

		if (!result.success) {
			return NextResponse.json(
				{
					success: false,
					error: result.error || "Search failed",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				data: result.data,
				count: result.data?.length || 0,
				searchParams: {
					from: validationResult.data.fromAirport,
					to: validationResult.data.toAirport,
					departure: validationResult.data.departureDate,
					return: validationResult.data.returnDate,
					passengers: validationResult.data.passengers,
					class: validationResult.data.travelClass,
					tripType: validationResult.data.tripType,
				},
			},
			{
				headers: {
					"Cache-Control": "private, no-cache, no-store, must-revalidate",
					Pragma: "no-cache",
					Expires: "0",
				},
			}
		);
	} catch (error) {
		console.error("Flight search API error:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// GET endpoint for simple searches (optional)
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);

	try {
		// Extract parameters from URL
		const from = searchParams.get("from");
		const to = searchParams.get("to");
		const departure = searchParams.get("departure");
		const returnDate = searchParams.get("return");
		const adults = parseInt(searchParams.get("adults") || "1");
		const children = parseInt(searchParams.get("children") || "0");
		const infants = parseInt(searchParams.get("infants") || "0");
		const travelClass = (searchParams.get("class") || "e") as
			| "e"
			| "b"
			| "f"
			| "w";
		const directOnly = searchParams.get("directOnly") === "true";

		if (!from || !to || !departure) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing required parameters: from, to, departure",
				},
				{ status: 400 }
			);
		}

		// Build request object for validation
		const requestData = {
			fromAirport: { iata: from, name: "", city: "", country: "" },
			toAirport: { iata: to, name: "", city: "", country: "" },
			departureDate: departure,
			returnDate,
			passengers: { adults, children, infants },
			travelClass,
			tripType: returnDate ? ("roundtrip" as const) : ("oneway" as const),
			directOnly,
		};

		// Transform and search
		const apiParams = transformToApiParams(requestData);
		const result = await searchRecommendations(apiParams);

		if (!result.success) {
			return NextResponse.json(
				{
					success: false,
					error: result.error || "Search failed",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data: result.data,
			count: result.data?.length || 0,
		});
	} catch (error) {
		console.error("Flight search GET error:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 }
		);
	}
}
