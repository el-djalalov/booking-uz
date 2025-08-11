"use client";

import React from "react";
import { motion } from "motion/react";
import { MoveLeft, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwapButtonProps {
	onSwap: () => void;
	disabled: boolean;
}

export const SwapButton: React.FC<SwapButtonProps> = ({ onSwap, disabled }) => {
	return (
		<div className="absolute left-40 sm:left-60 top-8 md:top-0 md:left-0 md:transform md:-translate-x-1/2 z-20 group">
			<motion.div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onSwap}
					disabled={disabled}
					className="h-10 w-10 rounded-full bg-white border-2 border-slate-300 group-hover:border-primary shadow-sm relative z-20"
				/>

				<MoveLeft
					onClick={onSwap}
					size={18}
					className="md:group-hover:-translate-x-3 group-hover:-translate-y-3 md:group-hover:-translate-y-2 group-hover:text-primary absolute top-4 left-6 md:left-1/2 transform -translate-x-1/2 -translate-y-1/2 translate-2 text-neutral-400 z-20 transition duration-300 hover:bg-transparent rotate-90 md:rotate-0"
				/>
				<MoveRight
					onClick={onSwap}
					size={18}
					className="md:group-hover:-translate-x-1.5 group-hover:-translate-y-1.5 md:group-hover:-translate-y-2  group-hover:text-primary absolute top-6 md:top-6.5 left-4 md:left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-2 text-neutral-400 z-20 transition duration-300 rotate-90 md:rotate-0"
				/>
			</motion.div>
			<div className="hidden xl:block w-px h-14 bg-neutral-300 dark:bg-neutral-500 absolute top-0 transform translate-x-5 -translate-y-2 z-10" />
		</div>
	);
};
