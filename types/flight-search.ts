export interface FlightSearchParams {
	adt: number;
	chd: number;
	inf: number;
	ins?: number;
	src?: number;
	yth?: number;
	class: "e" | "b" | "f" | "w";
	segments: FlightSegment[];
	filter_airlines?: string[];
	is_direct_only?: boolean;
	gds_white_list?: number[];
	gds_black_list?: number[];
	lang?: string;
	count?: number;
}

export interface FlightSegment {
	from: string;
	to: string;
	date: string;
}

export interface FlightRecommendation {
	id: string;
	price: {
		amount: number;
		passengers_amounts: {
			adult: number;
		};
	};
	duration: number;
	segments_count: number;
	is_baggage: boolean;
	is_refund: boolean;
	is_change: boolean;
	provider: {
		gds: number;
		name: string;
		supplier: {
			code: string;
			title: string;
		};
	};
	segments: FlightSegmentDetails[];
}

export interface FlightSegmentDetails {
	dep: {
		date: string;
		time: string;
		airport: { code: string; title: string };
		city: { code: string; title: string };
		country: { code: string; title: string };
	};
	arr: {
		date: string;
		time: string;
		airport: { code: string; title: string };
		city: { code: string; title: string };
		country: { code: string; title: string };
	};
	flight_number: string;
	duration: {
		flight: { common: number; hour: number; minute: number };
	};
	carrier: { code: string; title: string };
	aircraft: { code: string; title: string };
	class: { name: string; service: string };
}
