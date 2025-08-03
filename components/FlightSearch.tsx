// components/flight-search.tsx
"use client";
import { useState } from "react";
import { Calendar, Users, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Airport } from "@/lib/airport-service";
import { cn } from "@/lib/utils";
import { AmadeusAirportAutocomplete } from "./airport-auto-complete";

export const FlightSearch = () => {
	const [tripType, setTripType] = useState<"oneway" | "roundtrip">("roundtrip");
	const [passengers, setPassengers] = useState(1);
	const [fromAirport, setFromAirport] = useState<Airport | null>(null);
	const [toAirport, setToAirport] = useState<Airport | null>(null);
	const [departureDate, setDepartureDate] = useState("");
	const [returnDate, setReturnDate] = useState("");
	const [travelClass, setTravelClass] = useState("economy");

	const handleSwapAirports = () => {
		const temp = fromAirport;
		setFromAirport(toAirport);
		setToAirport(temp);
	};

	const handleSearch = () => {
		const searchData = {
			from: fromAirport,
			to: toAirport,
			departureDate,
			returnDate: tripType === "roundtrip" ? returnDate : null,
			passengers,
			class: travelClass,
			tripType,
		};

		console.log("Search data:", searchData);
		// Here you can integrate with flight search APIs like:
		// - Amadeus Flight Offers Search API
		// - Skyscanner API
		// - Kiwi.com API
	};

	return (
		<Card className="w-full max-w-6xl mx-auto bg-white/40 backdrop-blur-3xl shadow-medium rounded-3xl">
			<CardContent className="py-2 px-6">
				{/* Trip Type Selection */}
				<div className="flex gap-4 mb-6">
					<Button
						variant={tripType === "roundtrip" ? "default" : "outline"}
						onClick={() => setTripType("roundtrip")}
						className={cn(
							"transition-all duration-300 cursor-pointer",
							tripType === "roundtrip" ? "bg-primary" : "hover:bg-auto"
						)}
					>
						Round Trip
					</Button>
					<Button
						variant={tripType === "oneway" ? "default" : "outline"}
						onClick={() => setTripType("oneway")}
						className={cn(
							"transition-all duration-300 cursor-pointer",
							tripType === "oneway" ? "bg-primary" : "hover:bg-auto"
						)}
					>
						One Way
					</Button>
				</div>

				{/* Airport Selection */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
					<div className="lg:col-span-3">
						<div className="relative flex gap-8">
							{/* From Airport */}
							<AmadeusAirportAutocomplete
								id="from"
								label="From"
								placeholder="Departure city"
								value={fromAirport}
								onSelect={setFromAirport}
								className="w-1/2"
							/>

							{/* Swap Button */}
							<div className="absolute z-20 top-7 left-[285px] w-10 flex items-end justify-center">
								<Button
									variant="outline"
									size="icon"
									onClick={handleSwapAirports}
									className="h-12 w-12 rounded-full hover:bg-primary hover:text-white cursor-pointer transition-all duration-300"
								>
									<ArrowRightLeft className="h-4 w-4" />
								</Button>
							</div>

							{/* To Airport */}
							<AmadeusAirportAutocomplete
								id="to"
								label="To"
								placeholder="Destination city"
								value={toAirport}
								onSelect={setToAirport}
								className="w-1/2"
							/>
						</div>
					</div>

					{/* Departure Date */}
					<div className="lg:col-span-1">
						<Label
							htmlFor="departure"
							className="text-sm font-medium mb-2 ml-4 block"
						>
							Departure
						</Label>
						<div className="relative">
							<Calendar className="absolute left-3 top-4 h-4 w-4 text-muted-foreground z-10" />
							<Input
								id="departure"
								type="date"
								value={departureDate}
								onChange={e => setDepartureDate(e.target.value)}
								className="pl-10 h-12 bg-white/80 border-slate focus:ring-primary"
							/>
						</div>
					</div>

					{/* Return Date */}
					{tripType === "roundtrip" && (
						<div className="lg:col-span-1">
							<Label
								htmlFor="return"
								className="text-sm font-medium mb-2 ml-4 block"
							>
								Return
							</Label>
							<div className="relative">
								<Calendar className="absolute left-3 top-4 h-4 w-4 text-muted-foreground z-10" />
								<Input
									id="return"
									type="date"
									value={returnDate}
									onChange={e => setReturnDate(e.target.value)}
									className="pl-10 h-12 bg-white/80 border-slate focus:ring-primary"
								/>
							</div>
						</div>
					)}
				</div>

				{/* Passengers and Class */}
				<div className="flex gap-4 w-full mb-12">
					<div className="w-1/2">
						<Label
							htmlFor="passengers"
							className="text-sm font-medium mb-2 ml-4 block"
						>
							Passengers
						</Label>
						<div className="relative">
							<Users className="absolute left-3 top-4 h-4 w-4 text-muted-foreground z-10" />
							<Select
								value={passengers.toString()}
								onValueChange={value => setPassengers(parseInt(value))}
							>
								<SelectTrigger className="pl-10 !h-12 bg-white/80 w-full border-slate focus:ring-primary text-left">
									<SelectValue placeholder="1 Passenger" />
								</SelectTrigger>
								<SelectContent>
									{[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
										<SelectItem key={num} value={num.toString()}>
											{num} {num === 1 ? "Passenger" : "Passengers"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="w-1/2">
						<Label
							htmlFor="class"
							className="text-sm ml-4 font-medium mb-2 block w-full"
						>
							Class
						</Label>
						<Select value={travelClass} onValueChange={setTravelClass}>
							<SelectTrigger className="!h-12 bg-white/80 border-slate w-full text-left">
								<SelectValue placeholder="Select class" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="economy">Economy</SelectItem>
								<SelectItem value="premium">Premium Economy</SelectItem>
								<SelectItem value="business">Business</SelectItem>
								<SelectItem value="first">First Class</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Search Button */}
				<Button
					onClick={handleSearch}
					disabled={!fromAirport || !toAirport || !departureDate}
					className="w-full h-14 text-lg font-semibold bg-primary hover:opacity-90 transition-all duration-300 transform disabled:opacity-50"
					size="lg"
				>
					Search Flights
				</Button>

				{/* Best Price Guarantee */}
				<div className="mt-4 text-center">
					<p className="text-sm text-muted-foreground">
						<span className="font-semibold text-primary">
							Best Price Guarantee
						</span>{" "}
						- We offer the cheapest tickets in town!
					</p>
				</div>
			</CardContent>
		</Card>
	);
};
