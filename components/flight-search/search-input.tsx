"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AirportSearch } from "@/hooks/use-airport-search";
import { Airport } from "@/types/shared";
import { AirportInputProps } from "./types";

export const AirportInput: React.FC<AirportInputProps> = ({
	value,
	airport,
	placeholder,
	icon: Icon,
	onChange,
	onAirportSelect,
	onClear,
	showSearch,
	onToggleSearch,
	className = "",
}) => {
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		onChange(inputValue);

		if (airport && inputValue !== `${airport.iata} - ${airport.name}`) {
			onAirportSelect(null as any);
		}

		if (inputValue.length >= 3) {
			onToggleSearch(true);
		} else {
			onToggleSearch(false);
		}
	};

	const handleFocus = () => {
		if (!airport && value.length >= 3) {
			onToggleSearch(true);
		}
	};

	return (
		<div className={`relative airport-search-container ${className}`}>
			<div
				className={`relative flex justify-center items-center ${
					placeholder === "From" ? "" : "pl-4"
				}`}
			>
				<Icon size={28} className="dark:text-neutral-400 text-slate-400 mb-1" />
				<Input
					type="text"
					placeholder={placeholder}
					value={value}
					onChange={handleInputChange}
					onFocus={handleFocus}
					className="truncate border-0 py-0 pl-2 pr-4 h-12 font-semibold focus-visible:ring-0 placeholder:text-slate-400 dark:placeholder:text-neutral-400 placeholder:text-[17px] dark:bg-transparent dark:text-white"
					style={{ fontSize: "15px" }}
				/>
				{value && (
					<button
						type="button"
						onClick={onClear}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 dark:bg-neutral-400 bg-slate-300 hover:bg-slate-500 dark:hover:bg-gray-500 rounded-full transition-colors cursor-pointer z-10"
					>
						<X size={16} className="text-slate-600 dark:text-slate-900" />
					</button>
				)}
			</div>

			<AnimatePresence>
				{showSearch && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute top-full -left-2 right-0 z-50 mt-2"
					>
						<AirportSearch
							query={value}
							onSelect={(airport: Airport) => {
								onAirportSelect(airport);
								onToggleSearch(false);
							}}
							onClose={() => onToggleSearch(false)}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
