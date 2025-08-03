export interface AmadeusTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
	state: string;
}

export interface AmadeusLocation {
	type: string;
	subType: string;
	name: string;
	detailedName: string;
	id: string;
	self: {
		href: string;
		methods: string[];
	};
	timeZoneOffset: string;
	iataCode: string;
	geoCode: {
		latitude: number;
		longitude: number;
	};
	address: {
		cityName: string;
		cityCode: string;
		countryName: string;
		countryCode: string;
		regionCode: string;
	};
}

export interface AmadeusLocationResponse {
	meta: {
		count: number;
		links: {
			self: string;
		};
	};
	data: AmadeusLocation[];
}

export interface FlightDestination {
	type: string;
	origin: string;
	destination: string;
	departureDate: string;
	returnDate: string;
	price: {
		total: string;
	};
	links: {
		flightDates: string;
		flightOffers: string;
	};
}

export interface FlightDestinationsResponse {
	meta: {
		currency: string;
		links: {
			self: string;
		};
		defaults: {
			departureDate: string;
			oneWay: boolean;
			duration: string;
			nonStop: boolean;
			maxPrice: number;
			viewBy: string;
		};
	};
	data: FlightDestination[];
}
