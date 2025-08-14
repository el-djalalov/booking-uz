"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function FlightSearchLoadingSkeleton() {
	return (
		<div className="bg-background pt-26 container mx-auto space-y-4">
			{/* Search Parameters */}
			<div className="flex">
				<div className="flex items-center space-x-2">
					<Skeleton className="h-8 w-40" />
					<Skeleton className="h-8 w-40" />
					<Skeleton className="h-8 w-35" />
					<Skeleton className="h-8 w-30" />
				</div>
			</div>

			{/* Filters */}

			{/* Flight Cards Skeleton */}
			<div className="flex gap-4">
				<Skeleton className="w-80 h-[calc(100vh-180px)]" />
				<div className="space-y-4 flex-1">
					{[1, 2, 3, 4, 5].map((_, index) => (
						<div
							key={index}
							className="bg-card border rounded-lg p-3 animate-pulse h-[172px]"
						>
							<div className="flex justify-between mb-4">
								<div className="space-y-2">
									<Skeleton className="h-5 w-32" />
									<Skeleton className="h-4 w-24" />
								</div>
								<div className="text-right flex flex-col gap-1">
									<Skeleton className="h-6 w-24" />
									<Skeleton className="h-4 w-16" />
								</div>
							</div>

							<div className="flex justify-between items-center">
								<div className="space-y-2">
									<Skeleton className="h-6 w-16" /> {/* Departure time */}
									<Skeleton className="h-4 w-12" /> {/* Airport code */}
								</div>
								<div className="flex-1 mx-4">
									<div className="border-t w-full relative">
										<Skeleton className="h-8 w-8 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
									</div>
									<div className="text-center  transform translate-y-7">
										<Skeleton className="h-4 w-16 mx-auto" /> {/* Duration */}
									</div>
								</div>
								<div className="space-y-2 text-right">
									<Skeleton className="h-6 w-16" /> {/* Arrival time */}
									<Skeleton className="h-4 w-12" /> {/* Airport code */}
								</div>
							</div>

							<div className="mt-4 text-right">
								<Skeleton className="h-6 w-24 ml-auto" /> {/* Select button */}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Loading Complete Message */}
			<div className="container mx-auto">
				<Skeleton className="h-12 w-full" />
			</div>
		</div>
	);
}
