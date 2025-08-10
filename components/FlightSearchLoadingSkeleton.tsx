"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export function FlightSearchLoadingSkeleton() {
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
				return newProgress >= 95 ? 95 : newProgress;
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
			<div className="mb-8 container mx-auto mt-12">
				<Skeleton className="h-10 w-64 mb-4" />

				<Card>
					<CardContent className="p-4 mx-auto container">
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

			{/* Results Header Skeleton */}
			<div className="flex justify-between items-center mb-6 mx-auto container">
				<Skeleton className="h-7 w-48" />
				<div className="flex gap-2">
					<Skeleton className="h-6 w-28 rounded-full" />
				</div>
			</div>

			{/* Progressive Flight Cards Skeleton */}
			<div className="space-y-6 mx-auto">
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
			<div className="mt-8 text-center mx-auto">
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

function FlightSearchSkeleton({ delay = 0 }: { delay?: number }) {
	return (
		<Card
			className="hover:shadow-lg transition-shadow duration-200 animate-pulse container mx-auto"
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
