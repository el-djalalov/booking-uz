export interface Airport {
	iata: string;
	name: string;
	city: string;
	country: string;
	countryCode?: string;
	latitude?: number;
	longitude?: number;
	type?: "airport" | "city";
}
