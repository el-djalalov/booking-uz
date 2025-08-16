"use client";

import { useQuery } from "@tanstack/react-query";
import { getFlightSearchQuery } from "@/lib/queries/flight-search";
import { FlightSearchFormData } from "@/lib/schema/flight-search";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { FlightSearchLoadingSkeleton } from "@/components/flight-results/FlightResultLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { ProgressiveFlightResults } from "@/components/flight-results/ProgessiveFlightResults";
import Filters from "@/components/flight-results/Filters";
import { FlightSearch } from "@/components/flight-search";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { useSearchParams } from "next/navigation";
import {
	CheckCheck,
	ChevronRight,
	MapPin,
	RefreshCcw,
	Users,
} from "lucide-react";
import Image from "next/image";
import { FlightSearchSuccessResponse } from "@/types/flight-search";

interface SearchResultsProps {
	searchData: FlightSearchFormData;
}

export function SearchResults({ searchData }: SearchResultsProps) {
	const { data, isLoading, isError, error, refetch } =
		useQuery<FlightSearchSuccessResponse>(getFlightSearchQuery(searchData));

	const searchParams = useSearchParams();

	const fromCity = searchParams?.get("fromCity");
	const toCity = searchParams?.get("toCity");

	if (isLoading) {
		return <FlightSearchLoadingSkeleton />;
	}

	if (isError) {
		return (
			<div className="container mx-auto p-8 ">
				<div className="text-center py-12">
					<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
						<h2 className="text-lg font-semibold text-red-800 mb-2">
							❌ Search Error
						</h2>
						<p className="text-red-600 mb-4">{error.message}</p>

						<Button>Try Again</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!data?.data?.flights?.length) {
		return (
			<div className="text-center flex items-center flex-col justify-items-start pt-36 gap-8 min-h-screen">
				<div className="flex flex-col items-center justify-center">
					<Image
						alt="No Data "
						src="./noData.svg"
						width={80}
						height={80}
						className="dark:invert dark:opacity-90"
					/>
					<h2 className="text-xl font-semibold mb-4">
						No flights found for {searchParams?.get("departure")}
						<br />
					</h2>
					<p className="text-gray-600">Try adjusting your search criteria</p>
				</div>

				<FlightSearch />
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<div className="container mx-auto mt-24 flex flex-col">
				<div className="flex items-center p-0 rounded-lg gap-4">
					<div className="flex gap-2 bg-blue-50 dark:bg-blue-950 p-1.5 rounded-lg text-sm">
						<span>
							<MapPin className="text-blue-500" size={20} />
						</span>
						{fromCity}
						<ChevronRight className="text-muted-foreground" size={20} />
						{toCity}
					</div>

					<div className="flex items-center gap-4 text-sm bg-orange-50 dark:bg-orange-950 p-1.5 rounded-lg">
						<div className="flex items-center gap-2">
							<Users className="text-orange-500" size={20} />
							{searchData.passengers.adults} adult(s)
							{searchData.passengers.children > 0 &&
								`, ${searchData.passengers.children} child(ren)`}
							{searchData.passengers.infants > 0 &&
								`, ${searchData.passengers.infants} infant(s)`}
						</div>
					</div>
					<div className="flex items-center gap-4 text-sm bg-green-50 dark:bg-green-950 p-1.5 rounded-lg">
						<CheckCheck className="text-green-500" size={20} />
						{data?.data?.flights?.length || 0} flight
						{(data?.data?.flights?.length || 0) !== 1 ? "s" : ""} found
					</div>

					<Drawer direction="top">
						<DrawerTrigger asChild>
							<Button variant="outline" className="cursor-pointer">
								<RefreshCcw />
								Change flight
							</Button>
						</DrawerTrigger>
						<DrawerContent className="max-w-7xl mx-auto">
							<DrawerHeader>
								<DrawerTitle></DrawerTitle>
								<DrawerDescription></DrawerDescription>
							</DrawerHeader>
							<FlightSearch />
						</DrawerContent>
					</Drawer>
				</div>

				<div className="flex gap-4 py-4">
					<Filters />
					<ProgressiveFlightResults
						data={data}
						chunkSize={6}
						renderDelay={100}
						autoLoad={true}
						showProgress={true}
					/>
				</div>
			</div>
		</div>
	);
}
