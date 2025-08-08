"use client";

import React from "react";
import { RefreshCcw, ArrowRight } from "lucide-react";

interface TripTypeSelectorProps {
	value: "roundtrip" | "oneway";
	onChange: (value: "roundtrip" | "oneway") => void;
	onReturnDateReset: () => void;
}

export const TripTypeSelector: React.FC<TripTypeSelectorProps> = ({
	value,
	onChange,
	onReturnDateReset,
}) => {
	return (
		<div className="relative">
			<div className="flex bg-slate-100 dark:bg-white/15 p-1 rounded-lg relative overflow-hidden h-10 ">
				<div
					className="absolute top-1 bottom-1 w-1/2 bg-white rounded-md shadow-sm transition-transform duration-300 ease-out"
					style={{
						transform:
							value === "roundtrip" ? "translateX(0%)" : "translateX(95%)",
					}}
				/>

				<button
					type="button"
					onClick={() => {
						onChange("roundtrip");
						onReturnDateReset();
					}}
					className={`relative z-10 flex items-center pl-2 justify-items-start gap-2 h-8 flex-1 text-sm font-medium transition-colors duration-300 cursor-pointer ${
						value === "roundtrip"
							? "text-slate-900"
							: "text-slate-600 hover:text-slate-800 dark:text-white"
					}`}
				>
					<RefreshCcw className="h-4 w-4" />
					Round trip
				</button>

				<button
					type="button"
					onClick={() => {
						onChange("oneway");
						onReturnDateReset();
					}}
					className={`relative z-10 flex items-center ml-4 justify-items-start px-2 gap-2 h-8 flex-1 text-sm font-medium transition-colors duration-300 cursor-pointer ${
						value === "oneway"
							? "text-slate-900"
							: "text-slate-600 hover:text-slate-800 dark:text-white"
					}`}
				>
					<ArrowRight className="h-4 w-4" />
					One way
				</button>
			</div>
		</div>
	);
};
