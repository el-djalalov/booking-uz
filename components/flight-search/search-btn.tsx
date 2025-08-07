"use client";

import React from "react";
import { motion } from "motion/react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchButtonProps {
	isLoading: boolean;
	disabled: boolean;
	onSubmit: () => void;
}

export const SearchButton: React.FC<SearchButtonProps> = ({
	isLoading,
	disabled,
	onSubmit,
}) => {
	return (
		<motion.div whileTap={{ scale: 0.98 }}>
			<Button
				type="submit"
				disabled={disabled}
				onClick={onSubmit}
				className="h-10 bg-primary hover:bg-primary/80 text-white font-semibold rounded-lg"
			>
				{isLoading ? (
					<>
						<SearchIcon className="h-5 w-5 rotate-12 font-semibold" />
						Searching...
					</>
				) : (
					<>
						<SearchIcon className="h-5 w-5 rotate-12 font-semibold" />
						Search flights
					</>
				)}
			</Button>
		</motion.div>
	);
};
