import { z } from "zod";

const airportSchema = z.object({
	iata: z.string(),
	name: z.string(),
	city: z.string(),
	country: z.string(),
});

export const flightSearchSchema = z.object({
	tripType: z.enum(["oneway", "roundtrip"]),
	fromAirport: airportSchema.nullable(),
	toAirport: airportSchema.nullable(),
	departureDate: z.string().min(1, "Departure date is required"),
	returnDate: z.string().optional(),
	passengers: z.object({
		adults: z.number().min(1).max(9),
		children: z.number().min(0).max(9),
		infants: z.number().min(0).max(9),
	}),
	travelClass: z.enum(["e", "w", "b", "f"]),
	directOnly: z.boolean(),
});

export type FlightSearchFormData = z.infer<typeof flightSearchSchema>;
