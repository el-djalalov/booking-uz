"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DirectFlightCheckboxProps {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}

export const DirectFlightCheckbox: React.FC<DirectFlightCheckboxProps> = ({
	checked,
	onCheckedChange,
}) => {
	return (
		<div className="flex items-center gap-3">
			<Checkbox
				id="directFlight"
				checked={checked}
				onCheckedChange={onCheckedChange}
			/>
			<Label
				htmlFor="directFlight"
				className="text-sm text-foreground cursor-pointer"
			>
				Direct flights only
			</Label>
		</div>
	);
};
