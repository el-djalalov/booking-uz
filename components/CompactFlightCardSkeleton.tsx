import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export const CompactFlightCardSkeleton = () => {
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
