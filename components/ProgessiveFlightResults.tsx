// app/components/ProgressiveFlightResults.tsx
"use client";

import React, {
	useState,
	useEffect,
	useMemo,
	useCallback,
	useRef,
} from "react";
import { FlightRecommendation } from "@/types/flight-search";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Luggage, Plane, ChevronDown, Zap } from "lucide-react";

interface ProgressiveFlightResultsProps {
	flights: FlightRecommendation[];
	chunkSize?: number;
	renderDelay?: number;
	autoLoad?: boolean;
	showProgress?: boolean;
}

export function ProgressiveFlightResults({
	flights,
	chunkSize = 8,
	renderDelay = 100,
	autoLoad = true,
	showProgress = true,
}: ProgressiveFlightResultsProps) {
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

	// Memoized flight chunks with performance monitoring
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

	// Complete renderNextChunk function
	const renderNextChunk = useCallback(() => {
		if (renderedChunks >= flightChunks.length || isRendering) return;

		const chunkStartTime = performance.now();
		setIsRendering(true);

		// Use requestIdleCallback for non-blocking render with fallback
		const scheduleRender =
			window.requestIdleCallback ||
			((callback: IdleRequestCallback) => setTimeout(callback, renderDelay));

		scheduleRender(
			() => {
				const chunkEndTime = performance.now();
				const chunkRenderTime = chunkEndTime - chunkStartTime;

				setRenderedChunks(prev => {
					const newCount = prev + 1;

					// Update rendering stats
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
			{ timeout: renderDelay * 2 } // Fallback timeout
		);
	}, [renderedChunks, flightChunks.length, isRendering, renderDelay]);

	// ✅ Auto-render next chunk with improved timing
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

	// ✅ Intersection Observer for automatic loading when scrolled into view
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

	// ✅ Reset when flights change
	useEffect(() => {
		setRenderedChunks(1); // Show first chunk immediately
		setIsRendering(false);
		setRenderingStats({
			startTime: performance.now(),
			chunksRendered: 0,
			avgChunkTime: 0,
		});
	}, [flights]);

	// ✅ Cleanup on unmount
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
		<div className="space-y-4">
			{/* ✅ Enhanced Progress Header */}
			{showProgress && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-2">
							<Zap className="w-4 h-4 text-blue-600" />
							<span className="text-sm font-medium text-blue-800">
								Progressive Loading Active
							</span>
						</div>
						<span className="text-sm text-blue-600">
							{visibleFlights.length} / {flights.length} flights
						</span>
					</div>
					<Progress value={progressPercentage} className="h-2 mb-2" />

					{/* Performance Stats */}
					<div className="grid grid-cols-3 gap-4 text-xs text-blue-700">
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

			{/*  Render visible flights */}
			<div className="grid gap-4">
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

			{/* ✅ Loading skeletons for upcoming flights */}
			{isRendering && (
				<div className="grid gap-4">
					{Array.from({ length: Math.min(chunkSize, remainingCount) }).map(
						(_, index) => (
							<FlightCardSkeleton key={`skeleton-${index}`} />
						)
					)}
				</div>
			)}

			{/* ✅ Progressive loading controls */}
			{remainingCount > 0 && (
				<div ref={loadMoreRef} className="text-center py-6">
					{isRendering ? (
						<div className="flex items-center justify-center space-x-2">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
							<span>Loading more flights...</span>
						</div>
					) : (
						<div className="space-y-4">
							<p className="text-gray-600">
								Showing{" "}
								<span className="font-semibold">{visibleFlights.length}</span>{" "}
								of <span className="font-semibold">{flights.length}</span>{" "}
								flights
							</p>

							<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
								<Button
									onClick={renderNextChunk}
									className="bg-blue-600 hover:bg-blue-700"
									disabled={isRendering}
								>
									<ChevronDown className="w-4 h-4 mr-2" />
									Load More ({Math.min(chunkSize, remainingCount)} flights)
								</Button>

								<Button
									variant="outline"
									onClick={() => {
										setRenderedChunks(flightChunks.length);
									}}
									disabled={isRendering}
								>
									Load All Remaining ({remainingCount})
								</Button>
							</div>

							{/* Auto-load toggle */}
							<div className="flex items-center justify-center gap-2 text-sm text-gray-500">
								<input
									type="checkbox"
									checked={autoLoad}
									onChange={e => {
										// You'll need to lift this state up or use a context
										console.log("Auto-load toggled:", e.target.checked);
									}}
									className="rounded"
								/>
								<label>Auto-load when scrolling</label>
							</div>
						</div>
					)}
				</div>
			)}

			{/* ✅ Completion message */}
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

// ✅ Enhanced Flight Card with animation for new items
const FlightCard = React.memo(
	({
		flight,
		isNew = false,
	}: {
		flight: FlightRecommendation;
		isNew?: boolean;
	}) => {
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
								<span className="text-sm text-gray-600">
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

				{/* Your existing CardContent remains the same */}
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
				</CardContent>
			</Card>
		);
	}
);

// Loading skeleton component
const FlightCardSkeleton = () => {
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
};

FlightCard.displayName = "FlightCard";
