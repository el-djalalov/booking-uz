"use client";

import React, {
	useState,
	useEffect,
	useMemo,
	useCallback,
	useRef,
} from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";
import { FlightCard } from "./FlightResultCard";
import { CompactFlightCardSkeleton } from "./CompactFlightCardSkeleton";
import { ProgressiveFlightResultsProps } from "@/types/progressiveSearchResults";

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
		setRenderedChunks(1);
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
		<div className="space-y-3 flex-1">
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

			{/* {remainingCount === 0 && visibleFlights.length > 0 && (
				<div className="text-center py-6 bg-green-50 border border-green-200 rounded-lg">
					<div className="text-green-800 font-medium">
						All {flights.length} flights loaded successfully!
					</div>
					<div className="text-green-600 text-sm mt-1">
						Completed in {renderingStats.chunksRendered} chunks
					</div>
				</div>
			)} */}
		</div>
	);
}
