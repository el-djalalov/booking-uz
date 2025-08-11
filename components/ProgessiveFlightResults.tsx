"use client";

import React, {
	useState,
	useEffect,
	useMemo,
	useCallback,
	useRef,
} from "react";
import {
	FlightRecommendation,
	FlightSearchSuccessResponse,
	Search,
} from "@/types/flight-search";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Clock,
	Luggage,
	ChevronDown,
	ChevronUp,
	Zap,
	RefreshCw,
	Plane,
} from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Repeat, PlaneTakeoff, PlaneLanding, Wallet } from "lucide-react";
import { Separator } from "./ui/separator";

interface ProgressiveFlightResultsProps {
	data: FlightSearchSuccessResponse;
	chunkSize?: number;
	renderDelay?: number;
	autoLoad?: boolean;
	showProgress?: boolean;
}

export function ProgressiveFlightResults({
	data,
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
	const flights = data.data.flights;
	const search = data.data.search;

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

	// Auto-render next chunk with improved timing
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

	// Intersection Observer for automatic loading when scrolled into view
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

	// Cleanup on unmount
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
		<div className="space-y-3">
			{!showProgress && (
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

			{/* Render visible flights */}
			<div className="space-y-3">
				{visibleFlights.map((flight, index) => (
					<FlightCard
						key={flight.id || `flight-${index}`}
						flight={flight}
						search={search}
						isNew={
							index >= (renderedChunks - 1) * chunkSize &&
							index < renderedChunks * chunkSize
						}
					/>
				))}
			</div>

			{isRendering && (
				<div className="space-y-3">
					{Array.from({ length: Math.min(chunkSize, remainingCount) }).map(
						(_, index) => (
							<CompactFlightCardSkeleton key={`skeleton-${index}`} />
						)
					)}
				</div>
			)}

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
						</div>
					)}
				</div>
			)}

			{remainingCount === 0 && visibleFlights.length > 0 && (
				<div className="text-center py-6 bg-green-50 border border-green-200 rounded-lg">
					<div className="text-green-800 font-medium">
						All {flights.length} flights loaded successfully!
					</div>
					<div className="text-green-600 text-sm mt-1">
						Completed in {renderingStats.chunksRendered} chunks
					</div>
				</div>
			)}
		</div>
	);
}

const FlightCard = React.memo(
	({
		flight,
		search,
		isNew = false,
	}: {
		search: Search;
		flight: FlightRecommendation;
		isNew?: boolean;
	}) => {
		const [isOpen, setIsOpen] = useState(false);

		const formatDuration = (minutes: number) => {
			const hours = Math.floor(minutes / 60);
			const mins = minutes % 60;
			return `${hours}h ${mins}m`;
		};

		const formatPrice = (amount: number) => {
			return (
				new Intl.NumberFormat("en-US", {
					minimumFractionDigits: 0,
				}).format(amount) + " RUB"
			);
		};

		const formatDate = (dateStr: string) => {
			// Assuming date is in DD.MM.YYYY format
			const [day, month, year] = dateStr.split(".");
			const date = new Date(`${year}-${month}-${day}`);
			const options: Intl.DateTimeFormatOptions = {
				day: "numeric",
				month: "short",
				weekday: "short",
			};
			return date.toLocaleDateString("en-US", options);
		};

		const mainSegment = flight.segments[0];
		const depDateFormatted = formatDate(mainSegment.dep.date);
		const arrDateFormatted = formatDate(mainSegment.arr.date);

		return (
			<Card
				className={`transition-all duration-300 ${
					isNew ? "animate-in slide-in-from-bottom-4 fade-in-0" : ""
				}`}
			>
				<Collapsible open={isOpen} onOpenChange={setIsOpen}>
					<CardHeader className="px-4">
						<div className="flex items-center justify-between gap-12 w-full h-32">
							<div className="flex flex-col justify-between w-full h-full gap-2 p-2">
								<div className="font-semibold text-base uppercase">
									{mainSegment.carrier.title}
								</div>

								<div className="flex justify-between">
									<div className="text-left">
										<div className="font-semibold text-lg">
											{mainSegment.dep.time}
										</div>
										<div className="text-sm text-muted-foreground">
											{search.segments[0].from.name},{" "}
											{mainSegment.dep.airport.code}
										</div>
										<div className="text-xs text-muted-foreground">
											{depDateFormatted}
										</div>
									</div>

									<div className="flex-1 px-4 relative">
										<Plane className="text-muted-foreground absolute top-4 left-12" />
										<div className="absolute top-8 left-20 right-0 border-t border-muted-foreground border-dashed w-[75%]"></div>
										<div className="text-center relative z-10 text-muted-foreground flex flex-col justify-between h-full">
											<div className="text-xs text-muted-foreground">
												Flight time {formatDuration(flight.duration)}
											</div>

											<div className="text-xs text-muted-foreground">
												{flight.segments_count > 1
													? `${flight.segments_count - 1} stop(s)`
													: "Direct"}
											</div>
										</div>
										<Plane className="text-muted-foreground rotate-90 absolute top-4 right-6" />
									</div>

									<div className="text-right">
										<div className="font-semibold text-lg">
											{mainSegment.arr.time}
										</div>
										<div className="text-sm text-muted-foreground">
											{search.segments[0].to.name},{" "}
											{mainSegment.arr.airport.code}
										</div>
										<div className="text-xs text-muted-foreground">
											{arrDateFormatted}
										</div>
									</div>
								</div>
							</div>

							<div className="flex flex-col items-center justify-between w-[20%] h-full py-2">
								<span className="text-[20px] font-bold text-orange-400 w-full">
									{formatPrice(flight.price.RUB.amount)}
								</span>

								<div className="flex items-center gap-2">
									<Button className="" variant="outline">
										Select
									</Button>
									<CollapsibleTrigger asChild>
										<Button variant="ghost" size="sm" className="p-0">
											{isOpen ? (
												<ChevronUp className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)}
										</Button>
									</CollapsibleTrigger>
								</div>
							</div>
						</div>
					</CardHeader>

					<CollapsibleContent>
						<CardContent className="px-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<div className="flex items-center gap-2 mb-2">
									<Plane className="w-4 h-4 text-gray-400" />
									<div className="font-medium">{mainSegment.carrier.title}</div>
								</div>
								<div className="text-sm text-gray-600 mb-2">
									{mainSegment.aircraft.title}
								</div>
								<div className="flex items-start gap-2 mb-2">
									<PlaneTakeoff className="w-4 h-4 text-gray-400 mt-1" />
									<div>
										<div className="font-medium">
											{mainSegment.dep.airport.title} (
											{mainSegment.dep.airport.code})
										</div>
										<div className="text-sm text-gray-600">
											{mainSegment.dep.time}, {depDateFormatted}
										</div>
									</div>
								</div>
								<div className="flex items-start gap-2 mb-2">
									<PlaneLanding className="w-4 h-4 text-gray-400 mt-1" />
									<div>
										<div className="font-medium">
											{mainSegment.arr.airport.title} (
											{mainSegment.arr.airport.code})
										</div>
										<div className="text-sm text-gray-600">
											{mainSegment.arr.time}, {arrDateFormatted}
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2 mb-2">
									<Clock className="w-4 h-4 text-gray-400" />
									<div className="text-sm text-gray-600">
										Arrival {mainSegment.arr.time}, {arrDateFormatted}, in
										flight {formatDuration(flight.duration)}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Luggage className="w-4 h-4 text-gray-400" />
									<div className="text-sm text-gray-600">
										{flight.is_baggage ? "Baggage included" : "No baggage"}
									</div>
								</div>
							</div>
							<div className="bg-card p-3 rounded-md">
								<div className="text-sm font-medium mb-2">
									Price per passenger:
								</div>
								<div className="space-y-1 text-sm">
									<div className="flex justify-between">
										<span>Adult</span>
										<span>
											{formatPrice(
												flight.price.RUB.passengers_amounts.adult || 0
											)}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Child</span>
										<span>
											{formatPrice(
												flight.price.RUB.passengers_amounts.child || 0
											)}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Infant</span>
										<span>
											{formatPrice(
												flight.price.RUB.passengers_amounts.infant || 0
											)}
										</span>
									</div>
								</div>
								<div className="mt-4 flex gap-2">
									<Badge variant="outline">STANDARD</Badge>
									{flight.upgrades?.length > 0 && (
										<Badge variant="outline">FLEX</Badge>
									)}
								</div>
							</div>
						</CardContent>
					</CollapsibleContent>
				</Collapsible>
			</Card>
		);
	}
);

const CompactFlightCardSkeleton = () => {
	return (
		<Card className="animate-pulse border border-gray-200">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4 flex-1">
						<div className="flex items-center space-x-2">
							<Skeleton className="h-6 w-16" />
							<Skeleton className="h-6 w-20" />
						</div>

						<div className="flex items-center space-x-3 flex-1">
							<div className="text-center">
								<Skeleton className="h-6 w-12 mb-1" />
								<Skeleton className="h-4 w-8" />
							</div>

							<div className="flex items-center space-x-2 flex-1">
								<Skeleton className="h-[1px] flex-1" />
								<Skeleton className="h-8 w-8 rounded-full" />
								<Skeleton className="h-[1px] flex-1" />
							</div>

							<div className="text-center">
								<Skeleton className="h-6 w-12 mb-1" />
								<Skeleton className="h-4 w-8" />
							</div>
						</div>

						<div className="flex items-center space-x-3">
							<Skeleton className="h-4 w-8" />
							<Skeleton className="h-4 w-8" />
						</div>
					</div>

					<div className="flex items-center space-x-4">
						<div className="text-right">
							<Skeleton className="h-6 w-20 mb-1" />
							<Skeleton className="h-3 w-16" />
						</div>
						<Skeleton className="h-8 w-10" />
						<Skeleton className="h-8 w-20" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

FlightCard.displayName = "FlightCard";
