// app/search/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFlightSearch } from "@/hooks/use-flight-search";
import { FlightSearchFormData } from "@/lib/schema/flight-search";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, Plane, Luggage, Users } from "lucide-react";
import { FlightRecommendation } from "@/types/flight-search";

function FlightCard({ flight }: { flight: FlightRecommendation }) {
	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h ${mins}m`;
	};

	const formatPrice = (amount: number) => {
		return new Intl.NumberFormat("ru-RU", {
			style: "currency",
			currency: "RUB",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const mainSegment = flight.segments[0];

	return (
		<Card className="hover:shadow-lg transition-shadow duration-200">
			<CardHeader className="pb-4">
				<div className="flex justify-between items-start">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<Badge variant="secondary">
								{mainSegment.carrier.code} {mainSegment.flight_number}
							</Badge>
							<span className="text-sm text-gray-600">
								{mainSegment.carrier.title}
							</span>
						</div>
						<div className="text-xs text-gray-500">
							{mainSegment.aircraft.title}
						</div>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-green-600">
							{formatPrice(flight.price.RUB.amount)}
						</div>
						<div className="text-xs text-gray-500">per adult</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				{/* Flight Route */}
				<div className="flex items-center justify-between mb-4">
					<div className="text-center">
						<div className="text-2xl font-bold">{mainSegment.dep.time}</div>
						<div className="text-sm font-medium">
							{mainSegment.dep.airport.code}
						</div>
						<div className="text-xs text-gray-500">
							{mainSegment.dep.city.title}
						</div>
						{mainSegment.dep.terminal && (
							<div className="text-xs text-gray-400">
								{mainSegment.dep.terminal}
							</div>
						)}
					</div>

					<div className="flex-1 px-4">
						<div className="flex items-center justify-center relative">
							<div className="flex-1 border-t border-gray-300"></div>
							<div className="flex items-center justify-center bg-blue-100 rounded-full p-2 mx-2">
								<Plane className="w-4 h-4 text-blue-600" />
							</div>
							<div className="flex-1 border-t border-gray-300"></div>
						</div>
						<div className="text-center mt-1">
							<div className="text-sm text-gray-600 flex items-center justify-center gap-1">
								<Clock className="w-3 h-3" />
								{formatDuration(flight.duration)}
							</div>
							<div className="text-xs text-gray-500">
								{flight.segments_count > 1
									? `${flight.segments_count - 1} stop(s)`
									: "Direct"}
							</div>
						</div>
					</div>

					<div className="text-center">
						<div className="text-2xl font-bold">{mainSegment.arr.time}</div>
						<div className="text-sm font-medium">
							{mainSegment.arr.airport.code}
						</div>
						<div className="text-xs text-gray-500">
							{mainSegment.arr.city.title}
						</div>
						{mainSegment.arr.terminal && (
							<div className="text-xs text-gray-400">
								{mainSegment.arr.terminal}
							</div>
						)}
					</div>
				</div>

				<Separator className="my-4" />

				{/* Flight Details */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
					<div className="flex items-center gap-2">
						<Luggage className="w-4 h-4 text-gray-400" />
						<div>
							<div className="font-medium">Baggage</div>
							<div className="text-gray-600">
								{flight.is_baggage
									? `${mainSegment.baggage.piece}pc ${mainSegment.baggage.weight}kg`
									: "Not included"}
							</div>
						</div>
					</div>

					<div>
						<div className="font-medium">Carry-on</div>
						<div className="text-gray-600">
							{mainSegment.cbaggage.piece}pc {mainSegment.cbaggage.weight}kg
						</div>
					</div>

					<div>
						<div className="font-medium">Fare Type</div>
						<div className="text-gray-600">
							{flight.fare_family_marketing_name}
						</div>
					</div>

					<div>
						<div className="font-medium">Flexibility</div>
						<div className="text-gray-600">
							{flight.is_refund ? "✓" : "✗"} Refund |{" "}
							{flight.is_change ? "✓" : "✗"} Change
						</div>
					</div>
				</div>

				{/* Action Button */}
				<div className="mt-6 flex justify-end">
					<Button className="bg-blue-600 hover:bg-blue-700">
						Select Flight
					</Button>
				</div>

				{/* Debug Info - Remove in production */}
				<details className="mt-4">
					<summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
						Debug: Full Flight Data
					</summary>
					<pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-auto max-h-40">
						{JSON.stringify(flight, null, 2)}
					</pre>
				</details>
			</CardContent>
		</Card>
	);
}

function SearchResults() {
	const searchParams = useSearchParams();

	if (!searchParams) {
		return <div className="p-8 text-center">Loading search parameters...</div>;
	}

	const searchData: FlightSearchFormData = {
		fromAirport: {
			iata: searchParams.get("from") || "",
			name: "",
			city: "",
			country: "",
		},
		toAirport: {
			iata: searchParams.get("to") || "",
			name: "",
			city: "",
			country: "",
		},
		departureDate: searchParams.get("departure") || "",
		returnDate: searchParams.get("return") || undefined,
		passengers: {
			adults: parseInt(searchParams.get("adults") || "1"),
			children: parseInt(searchParams.get("children") || "0"),
			infants: parseInt(searchParams.get("infants") || "0"),
		},
		travelClass: (searchParams.get("class") || "e") as "e" | "b" | "f" | "w",
		tripType:
			searchParams.get("tripType") === "roundtrip" ? "roundtrip" : "oneway",
		directOnly: searchParams.get("directOnly") === "true",
	};

	const {
		form,
		isPending,
		error,
		isSuccess,
		handleSubmit,
		flights, // ✅ Make sure your hook returns this
		flightCount, // ✅ And this
	} = useFlightSearch();

	useEffect(() => {
		if (
			searchData.fromAirport?.iata &&
			searchData.toAirport?.iata &&
			searchData.departureDate
		) {
			// Set form values
			form.setValue("fromAirport", searchData.fromAirport);
			form.setValue("toAirport", searchData.toAirport);
			form.setValue("departureDate", searchData.departureDate);
			form.setValue("returnDate", searchData.returnDate);
			form.setValue("passengers", searchData.passengers);
			form.setValue("travelClass", searchData.travelClass);
			form.setValue("tripType", searchData.tripType);
			form.setValue("directOnly", searchData.directOnly);

			// Trigger search
			setTimeout(() => {
				handleSubmit();
			}, 100);
		}
	}, [
		searchData.fromAirport?.iata,
		searchData.toAirport?.iata,
		searchData.departureDate,
	]);

	if (isPending) {
		return (
			<div className="container mx-auto p-8">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<h2 className="text-xl font-semibold mb-2">
						🔍 Searching for flights...
					</h2>
					<p className="text-gray-600">This may take a few moments</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto p-8">
				<div className="text-center py-12">
					<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
						<h2 className="text-lg font-semibold text-red-800 mb-2">
							❌ Search Error
						</h2>
						<p className="text-red-600 mb-4">{error.message}</p>
						<Button
							onClick={handleSubmit}
							className="bg-blue-500 hover:bg-blue-600"
						>
							Try Again
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (isSuccess && flights) {
		return (
			<div className="container mx-auto p-8">
				{/* Search Summary */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-4">Flight Results</h1>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between flex-wrap gap-4">
								<div className="flex items-center gap-6">
									<div className="text-center">
										<div className="font-semibold">
											{searchData.fromAirport?.iata}
										</div>
										<div className="text-sm text-gray-600">From</div>
									</div>

									<div className="flex items-center gap-2">
										<Plane className="w-4 h-4 text-gray-400" />
										<span className="text-sm text-gray-600">
											{searchData.tripType === "roundtrip"
												? "Round trip"
												: "One way"}
										</span>
									</div>

									<div className="text-center">
										<div className="font-semibold">
											{searchData.toAirport?.iata}
										</div>
										<div className="text-sm text-gray-600">To</div>
									</div>
								</div>

								<div className="flex items-center gap-4 text-sm text-gray-600">
									<div className="flex items-center gap-1">
										<Users className="w-4 h-4" />
										{searchData.passengers.adults} adult(s)
										{searchData.passengers.children > 0 &&
											`, ${searchData.passengers.children} child(ren)`}
										{searchData.passengers.infants > 0 &&
											`, ${searchData.passengers.infants} infant(s)`}
									</div>
									<div>Departure: {searchData.departureDate}</div>
									{searchData.returnDate && (
										<div>Return: {searchData.returnDate}</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Results Header */}
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-semibold">
						{flightCount || flights.length} flight
						{(flightCount || flights.length) !== 1 ? "s" : ""} found
					</h2>
					<div className="flex gap-2">
						<Badge variant="outline">Best Price First</Badge>
					</div>
				</div>

				{/* Flight Results */}
				<div className="space-y-6">
					{flights.map((flight, index: number) => (
						<FlightCard key={flight.id || index} flight={flight} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-8">
			<div className="text-center py-12">
				<h1 className="text-2xl font-bold mb-4">Flight Search</h1>
				<p className="text-gray-600">Preparing your search...</p>
			</div>
		</div>
	);
}

export default function SearchPage() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto p-8">
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
						<p>Loading search results...</p>
					</div>
				</div>
			}
		>
			<SearchResults />
		</Suspense>
	);
}
