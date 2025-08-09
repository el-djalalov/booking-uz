"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFlightSearch } from "@/hooks/use-flight-search";
import { FlightSearchFormData } from "@/lib/schema/flight-search";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Plane, Luggage, Users, Zap, ChevronDown } from "lucide-react";
import { FlightRecommendation } from "@/types/flight-search";
import { useState, useMemo, useCallback, useRef } from "react";

// Enhanced FlightCard component with progressive loading animation
function FlightCard({
	flight,
	isNew = false,
}: {
	flight: FlightRecommendation;
	isNew?: boolean;
}) {
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
		<Card
			className={`hover:shadow-lg transition-all duration-300 ${
				isNew ? "animate-in slide-in-from-bottom-4 fade-in-0" : ""
			}`}
		>
			<CardHeader className="pb-4">
				<div className="flex justify-between items-start">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<Badge variant="secondary">
								{mainSegment.carrier.code} {mainSegment.flight_number}
							</Badge>
							<span className="text-sm text-gray-400">
								{mainSegment.carrier.title}
							</span>
							{isNew && (
								<Badge variant="default" className="bg-green-500">
									New
								</Badge>
							)}
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
								<Plane className="w-4 h-4 text-gray-700" />
							</div>
							<div className="flex-1 border-t border-gray-300"></div>
						</div>
						<div className="text-center mt-1">
							<div className="text-sm text-gray-400 flex items-center justify-center gap-1">
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
							<div className="text-gray-400">
								{flight.is_baggage
									? `${mainSegment.baggage.piece}pc ${mainSegment.baggage.weight}kg`
									: "Not included"}
							</div>
						</div>
					</div>

					<div>
						<div className="font-medium">Carry-on</div>
						<div className="text-gray-400">
							{mainSegment.cbaggage.piece}pc {mainSegment.cbaggage.weight}kg
						</div>
					</div>

					<div>
						<div className="font-medium">Fare Type</div>
						<div className="text-gray-400">
							{flight.fare_family_marketing_name}
						</div>
					</div>

					<div>
						<div className="font-medium">Flexibility</div>
						<div className="text-gray-400">
							{flight.is_refund ? "✓" : "✗"} Refund |{" "}
							{flight.is_change ? "✓" : "✗"} Change
						</div>
					</div>
				</div>

				{/* Action Button */}
				<div className="mt-6 flex justify-end">
					<Button className="">Select Flight</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// Loading skeleton component for progressive loading
function FlightCardSkeleton() {
	return (
		<Card className="animate-pulse">
			<CardHeader>
				<div className="flex justify-between items-start">
					<div className="space-y-2">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-4 w-48" />
					</div>
					<Skeleton className="h-8 w-24" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between mb-4">
					<Skeleton className="h-16 w-20" />
					<Skeleton className="h-8 w-32" />
					<Skeleton className="h-16 w-20" />
				</div>
				<Separator className="my-4" />
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-12 w-full" />
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// Progressive Flight Results Component
function ProgressiveFlightResults({
	flights,
	chunkSize = 6,
	renderDelay = 150,
	autoLoad = true,
	showProgress = true,
}: {
	flights: FlightRecommendation[];
	chunkSize?: number;
	renderDelay?: number;
	autoLoad?: boolean;
	showProgress?: boolean;
}) {
	const [renderedChunks, setRenderedChunks] = useState(0);
	const [isRendering, setIsRendering] = useState(false);
	const [renderingStats, setRenderingStats] = useState({
		startTime: 0,
		chunksRendered: 0,
		avgChunkTime: 0,
	});

	const observerRef = useRef<IntersectionObserver>(null);
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const renderTimeoutRef = useRef<NodeJS.Timeout>(null);

	// Memoized flight chunks
	const flightChunks = useMemo(() => {
		console.log(
			`📦 Creating ${Math.ceil(flights.length / chunkSize)} chunks for ${
				flights.length
			} flights`
		);
		const chunks = [];
		for (let i = 0; i < flights.length; i += chunkSize) {
			chunks.push(flights.slice(i, i + chunkSize));
		}
		return chunks;
	}, [chunkSize, flights]);

	// Render next chunk function
	const renderNextChunk = useCallback(() => {
		if (renderedChunks >= flightChunks.length || isRendering) return;

		const chunkStartTime = performance.now();
		setIsRendering(true);

		const scheduleRender =
			window.requestIdleCallback ||
			((callback: IdleRequestCallback) => setTimeout(callback, renderDelay));

		scheduleRender(
			() => {
				const chunkEndTime = performance.now();
				const chunkRenderTime = chunkEndTime - chunkStartTime;

				setRenderedChunks(prev => {
					const newCount = prev + 1;

					setRenderingStats(stats => ({
						startTime: stats.startTime || chunkStartTime,
						chunksRendered: newCount,
						avgChunkTime:
							stats.avgChunkTime === 0
								? chunkRenderTime
								: (stats.avgChunkTime + chunkRenderTime) / 2,
					}));

					console.log(
						`⚡ Chunk ${newCount} rendered in ${chunkRenderTime.toFixed(2)}ms`
					);
					return newCount;
				});

				setIsRendering(false);
			},
			{ timeout: renderDelay * 2 }
		);
	}, [renderedChunks, flightChunks.length, isRendering, renderDelay]);

	// Auto-render next chunk
	useEffect(() => {
		if (renderedChunks < flightChunks.length && !isRendering && autoLoad) {
			renderTimeoutRef.current = setTimeout(renderNextChunk, renderDelay);
			return () => {
				if (renderTimeoutRef.current) {
					clearTimeout(renderTimeoutRef.current);
				}
			};
		}
	}, [
		renderedChunks,
		flightChunks.length,
		isRendering,
		renderNextChunk,
		renderDelay,
		autoLoad,
	]);

	// Intersection observer for auto-loading
	useEffect(() => {
		if (!autoLoad || renderedChunks >= flightChunks.length) return;

		const currentRef = loadMoreRef.current;
		if (!currentRef) return;

		observerRef.current = new IntersectionObserver(
			entries => {
				const [entry] = entries;
				if (entry.isIntersecting && !isRendering) {
					renderNextChunk();
				}
			},
			{ threshold: 0.1 }
		);

		observerRef.current.observe(currentRef);

		return () => {
			if (observerRef.current && currentRef) {
				observerRef.current.unobserve(currentRef);
			}
		};
	}, [
		renderNextChunk,
		renderedChunks,
		flightChunks.length,
		isRendering,
		autoLoad,
	]);

	// Reset when flights change
	useEffect(() => {
		setRenderedChunks(1); // Show first chunk immediately
		setIsRendering(false);
		setRenderingStats({
			startTime: performance.now(),
			chunksRendered: 0,
			avgChunkTime: 0,
		});
	}, [flights]);

	// Cleanup
	useEffect(() => {
		return () => {
			if (renderTimeoutRef.current) {
				clearTimeout(renderTimeoutRef.current);
			}
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, []);

	const visibleFlights = useMemo(() => {
		return flightChunks.slice(0, renderedChunks).flat();
	}, [flightChunks, renderedChunks]);

	const remainingCount = flights.length - visibleFlights.length;
	const progressPercentage = (visibleFlights.length / flights.length) * 100;

	return (
		<div className="space-y-6">
			{/* Progress indicator */}
			{showProgress && (
				<div className="dark:bg-card border rounded-lg p-4">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-2">
							<Zap className="w-4 h-4" />
							<span className="text-sm font-medium">
								Progressive Loading Active
							</span>
						</div>
						<span className="text-sm">
							{visibleFlights.length} / {flights.length} flights
						</span>
					</div>
					<Progress value={progressPercentage} className="h-2 mb-2" />

					{/* Performance Stats */}
					<div className="grid grid-cols-3 gap-4 text-xs">
						<div>
							<span className="font-medium">Progress:</span>{" "}
							{progressPercentage.toFixed(1)}%
						</div>
						<div>
							<span className="font-medium">Chunks:</span>{" "}
							{renderingStats.chunksRendered}
						</div>
						<div>
							<span className="font-medium">Avg Time:</span>{" "}
							{renderingStats.avgChunkTime.toFixed(1)}ms
						</div>
					</div>
				</div>
			)}

			{/* Render visible flights */}
			<div className="space-y-6">
				{visibleFlights.map((flight, index) => (
					<FlightCard
						key={flight.id || `flight-${index}`}
						flight={flight}
						isNew={
							index >= (renderedChunks - 1) * chunkSize &&
							index < renderedChunks * chunkSize
						}
					/>
				))}
			</div>

			{/* Loading skeletons */}
			{isRendering && (
				<div className="space-y-6">
					{Array.from({ length: Math.min(chunkSize, remainingCount) }).map(
						(_, index) => (
							<FlightCardSkeleton key={`skeleton-${index}`} />
						)
					)}
				</div>
			)}

			{/* Load more controls */}
			{remainingCount > 0 && (
				<div ref={loadMoreRef} className="text-center py-6">
					{isRendering ? (
						<div className="flex items-center justify-center space-x-2">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2"></div>
							<span>Loading more flights...</span>
						</div>
					) : (
						<div className="space-y-4">
							<p className="text-gray-400">
								Showing{" "}
								<span className="font-semibold">{visibleFlights.length}</span>{" "}
								of <span className="font-semibold">{flights.length}</span>{" "}
								flights
							</p>

							<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
								<Button
									onClick={renderNextChunk}
									className="bg-primary"
									disabled={isRendering}
								>
									<ChevronDown className="w-4 h-4 mr-2" />
									Load More ({Math.min(chunkSize, remainingCount)} flights)
								</Button>

								<Button
									variant="outline"
									onClick={() => setRenderedChunks(flightChunks.length)}
									disabled={isRendering}
								>
									Load All Remaining ({remainingCount})
								</Button>
							</div>
						</div>
					)}
				</div>
			)}

			{/*  Completion message */}
			{remainingCount === 0 && visibleFlights.length > 0 && (
				<div className="text-center py-6 bg-green-50 border border-green-200 rounded-lg">
					<div className="text-green-800 font-medium">
						✅ All {flights.length} flights loaded successfully!
					</div>
					<div className="text-green-600 text-sm mt-1">
						Completed in {renderingStats.chunksRendered} chunks
					</div>
				</div>
			)}
		</div>
	);
}

function FlightSearchSkeleton({ delay = 0 }: { delay?: number }) {
	return (
		<Card
			className="hover:shadow-lg transition-shadow duration-200 animate-pulse"
			style={{ animationDelay: `${delay}ms` }}
		>
			<CardHeader className="pb-4">
				<div className="flex justify-between items-start">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Skeleton className="h-5 w-20 rounded-full" />{" "}
							{/* Flight number badge */}
							<Skeleton className="h-4 w-32" /> {/* Airline name */}
						</div>
						<Skeleton className="h-3 w-40" /> {/* Aircraft type */}
					</div>
					<div className="text-right space-y-1">
						<Skeleton className="h-8 w-24" /> {/* Price */}
						<Skeleton className="h-3 w-16" /> {/* "per adult" */}
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				{/* Flight Route Skeleton */}
				<div className="flex items-center justify-between mb-4">
					{/* Departure */}
					<div className="text-center space-y-1">
						<Skeleton className="h-8 w-16 mx-auto" /> {/* Time */}
						<Skeleton className="h-4 w-12 mx-auto" /> {/* Airport code */}
						<Skeleton className="h-3 w-20 mx-auto" /> {/* City */}
						<Skeleton className="h-3 w-16 mx-auto" /> {/* Terminal */}
					</div>

					{/* Flight path */}
					<div className="flex-1 px-4">
						<div className="flex items-center justify-center relative">
							<div className="flex-1 border-t border-gray-300"></div>
							<Skeleton className="h-8 w-8 rounded-full mx-2" />{" "}
							{/* Plane icon */}
							<div className="flex-1 border-t border-gray-300"></div>
						</div>
						<div className="text-center mt-2 space-y-1">
							<Skeleton className="h-4 w-16 mx-auto" /> {/* Duration */}
							<Skeleton className="h-3 w-12 mx-auto" /> {/* Direct/stops */}
						</div>
					</div>

					{/* Arrival */}
					<div className="text-center space-y-1">
						<Skeleton className="h-8 w-16 mx-auto" /> {/* Time */}
						<Skeleton className="h-4 w-12 mx-auto" /> {/* Airport code */}
						<Skeleton className="h-3 w-20 mx-auto" /> {/* City */}
						<Skeleton className="h-3 w-16 mx-auto" /> {/* Terminal */}
					</div>
				</div>

				<Separator className="my-4" />

				{/* Flight Details Skeleton */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="space-y-2">
							<Skeleton className="h-4 w-16" /> {/* Detail label */}
							<Skeleton className="h-4 w-24" /> {/* Detail value */}
						</div>
					))}
				</div>

				{/* Action Button Skeleton */}
				<div className="flex justify-end">
					<Skeleton className="h-10 w-28 rounded" /> {/* Select button */}
				</div>
			</CardContent>
		</Card>
	);
}

function FlightSearchLoadingSkeleton() {
	const [loadingStage, setLoadingStage] = useState(0);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const stages = [
			{ delay: 0, stage: 0, text: "Initializing search..." },
			{ delay: 1000, stage: 1, text: "Connecting to airline systems..." },
			{ delay: 2500, stage: 2, text: "Searching available flights..." },
			{ delay: 4000, stage: 3, text: "Comparing prices..." },
			{ delay: 5500, stage: 4, text: "Processing results..." },
		];

		stages.forEach(({ delay, stage, text }) => {
			setTimeout(() => {
				setLoadingStage(stage);
			}, delay);
		});

		// Progress bar animation
		const progressInterval = setInterval(() => {
			setProgress(prev => {
				const newProgress = prev + Math.random() * 15;
				return newProgress >= 95 ? 95 : newProgress; // Stop at 95% to avoid completion
			});
		}, 300);

		return () => clearInterval(progressInterval);
	}, []);

	const stageMessages = [
		"Initializing search...",
		"Connecting to airline systems...",
		"Searching available flights...",
		"Comparing prices...",
		"Processing results...",
	];

	return (
		<>
			{/* Search Summary Skeleton */}
			<div className="mb-8">
				<Skeleton className="h-10 w-64 mb-4" />

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between flex-wrap gap-4">
							<div className="flex items-center gap-6">
								<div className="text-center">
									<Skeleton className="h-6 w-12 mb-1" />
									<Skeleton className="h-4 w-10" />
								</div>
								<div className="flex items-center gap-2">
									<Skeleton className="h-4 w-4 rounded-full" />
									<Skeleton className="h-4 w-20" />
								</div>
								<div className="text-center">
									<Skeleton className="h-6 w-12 mb-1" />
									<Skeleton className="h-4 w-10" />
								</div>
							</div>
							<div className="flex items-center gap-4">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-4 w-28" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Enhanced Search Status */}

			{/* Results Header Skeleton */}
			<div className="flex justify-between items-center mb-6">
				<Skeleton className="h-7 w-48" />
				<div className="flex gap-2">
					<Skeleton className="h-6 w-28 rounded-full" />
				</div>
			</div>

			{/* Progressive Flight Cards Skeleton */}
			<div className="space-y-6">
				{Array.from({ length: Math.min(6, loadingStage + 2) }).map(
					(_, index) => (
						<div
							key={`progressive-skeleton-${index}`}
							className={`transition-all duration-500 ${
								index <= loadingStage
									? "opacity-100 translate-y-0"
									: "opacity-60 translate-y-2"
							}`}
						>
							<FlightSearchSkeleton delay={index * 100} />
						</div>
					)
				)}
			</div>

			{/* Loading Tips */}
			<div className="mt-8 text-center">
				<Card className="bg-gray-50 border-gray-200">
					<CardContent className="p-4">
						<div className="text-sm text-gray-600">
							💡 <strong>Tip:</strong> We're searching across multiple airlines
							to find you the best deals. This comprehensive search ensures you
							get the most options and competitive prices.
						</div>
					</CardContent>
				</Card>
			</div>
		</>
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
		flights,
		flightCount,
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
				<FlightSearchLoadingSkeleton />
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
						<Button onClick={handleSubmit}>Try Again</Button>
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
						<CardContent className="px-4 py-0">
							<div className="flex items-center justify-between flex-wrap gap-4">
								<div className="flex items-center gap-6">
									<div className="text-center">
										<div className="font-semibold">
											{searchData.fromAirport?.iata}
										</div>
										<div className="text-sm text-gray-400">From</div>
									</div>

									<div className="flex items-center gap-2">
										<Plane className="w-4 h-4 text-gray-400" />
										<span className="text-sm text-gray-400">
											{searchData.tripType === "roundtrip"
												? "Round trip"
												: "One way"}
										</span>
									</div>

									<div className="text-center">
										<div className="font-semibold">
											{searchData.toAirport?.iata}
										</div>
										<div className="text-sm text-gray-400">To</div>
									</div>
								</div>

								<div className="flex items-center gap-4 text-sm text-gray-400">
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
						<Badge variant="secondary" className="px-2">
							Best Price First
						</Badge>
					</div>
				</div>

				{/* Progressive Flight Results */}
				<ProgressiveFlightResults
					flights={flights}
					chunkSize={6}
					renderDelay={150}
					autoLoad={true}
					showProgress={true}
				/>
			</div>
		);
	}
}

export default function SearchPage() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto p-8">
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"></div>
						<p>Loading search results...</p>
					</div>
				</div>
			}
		>
			<SearchResults />
		</Suspense>
	);
}
