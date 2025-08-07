"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PASSENGER_TYPES, MAX_PASSENGERS } from "./constants";
import { getPassengerText, getClassDisplayName } from "./utils";
import { toast } from "sonner";

interface PassengerClassSelectorProps {
	passengers: {
		adults: number;
		children: number;
		infants: number;
	};
	travelClass: string;
	isOpen: boolean;
	onToggle: () => void;
	onPassengerChange: (
		type: "adults" | "children" | "infants",
		delta: number
	) => void;
	onClassChange: (value: string) => void;
}

export const PassengerClassSelector: React.FC<PassengerClassSelectorProps> = ({
	passengers,
	travelClass,
	isOpen,
	onToggle,
	onPassengerChange,
	onClassChange,
}) => {
	const updatePassengerCount = (
		type: "adults" | "children" | "infants",
		delta: number
	) => {
		const current = passengers[type];
		const min = type === "adults" ? 1 : 0;
		const max = MAX_PASSENGERS;
		const newValue = Math.max(min, Math.min(max, current + delta));

		if (type === "infants" && newValue > passengers.adults) {
			toast.error("Number of infants cannot exceed number of adults");
			return;
		}

		onPassengerChange(type, delta);
	};

	return (
		<div className="flex-1 relative passengers-container">
			<Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 z-10 dark:text-neutral-400 text-slate-500 pointer-events-none" />
			<Button
				type="button"
				variant="ghost"
				onClick={onToggle}
				className="w-full h-12 justify-start text-left font-normal hover:bg-slate-100 dark:hover:bg-black/30 rounded-lg"
				style={{ fontSize: "15px" }}
			>
				<div className="flex items-center gap-2 text-left pl-6 font-semibold">
					<span>{getPassengerText(passengers)}</span>
					<span className="text-slate-400">•</span>
					<span>{getClassDisplayName(travelClass)}</span>
				</div>
			</Button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute z-50 right-0 mt-2 bg-white dark:bg-black/50 dark:backdrop-blur-md border-neutral/20 border rounded-lg shadow-2xl p-4 w-80 overflow-hidden"
					>
						{/* Passengers Section */}
						<div className="space-y-3 mb-4">
							<h4 className="font-medium text-sm">Passengers</h4>
							{PASSENGER_TYPES.map(({ key, label, description, min }) => (
								<div key={key} className="flex items-center justify-between">
									<div>
										<div className="font-medium text-sm">{label}</div>
										<div className="text-xs text-gray-500">{description}</div>
									</div>
									<div className="flex items-center gap-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => updatePassengerCount(key, -1)}
											disabled={passengers[key] <= min}
											className="h-6 w-6 p-0"
										>
											<Minus className="h-3 w-3" />
										</Button>
										<span className="w-6 text-center text-sm font-medium">
											{passengers[key]}
										</span>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => updatePassengerCount(key, 1)}
											disabled={passengers[key] >= MAX_PASSENGERS}
											className="h-6 w-6 p-0"
										>
											<Plus className="h-3 w-3" />
										</Button>
									</div>
								</div>
							))}
						</div>

						{/* Class Selection */}
						<div className="border-t pt-3">
							<h4 className="font-medium text-sm mb-2">Travel Class</h4>
							<Select value={travelClass} onValueChange={onClassChange}>
								<SelectTrigger className="h-8 text-sm cursor-pointer">
									<SelectValue>{getClassDisplayName(travelClass)}</SelectValue>
								</SelectTrigger>
								<SelectContent className="dark:bg-black/40 backdrop-blur-2xl">
									<SelectItem value="e">Economy</SelectItem>
									<SelectItem value="w">Premium Economy</SelectItem>
									<SelectItem value="b">Business</SelectItem>
									<SelectItem value="f">First Class</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Done Button */}
						<div className="mt-4 pt-3 border-t">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={onToggle}
								className="w-full cursor-pointer border-0"
							>
								Done
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
