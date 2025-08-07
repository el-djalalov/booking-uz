export const CLASS_DISPLAY_NAMES = {
	e: "Economy",
	w: "Premium Economy",
	b: "Business",
	f: "First Class",
} as const;

export const PASSENGER_TYPES = [
	{ key: "adults" as const, label: "Adults", description: "12+ years", min: 1 },
	{
		key: "children" as const,
		label: "Children",
		description: "2-11 years",
		min: 0,
	},
	{
		key: "infants" as const,
		label: "Infants",
		description: "0-2 years",
		min: 0,
	},
];

export const MAX_PASSENGERS = 9;
