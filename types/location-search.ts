export interface MyAgentAirport {
	airportName: string;
	airportIataCode: string;
}

export interface MyAgentCity {
	countryIataCode: string;
	countryName: string;
	cityName: string;
	cityIataCode: string;
	airports?: MyAgentAirport[];
	name?: string;
}

export interface LocationSearchResponse {
	cities: Record<string, MyAgentCity>;
}
