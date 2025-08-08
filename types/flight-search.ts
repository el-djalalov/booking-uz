// Base types
interface Airport {
	iata: string;
	name: string;
	city: string;
	country: string;
}

export interface PassengerCounts {
	adults: number;
	children: number;
	infants: number;
}

export type TravelClass = "e" | "b" | "f" | "w";
export type TripType = "oneway" | "roundtrip";

// Complete FlightRecommendation based on API doc
export interface FlightRecommendation {
	id: string;
	is_tour_operator: boolean;
	tariff: string;
	tariff_class: string;
	fare_family_type: string;
	fare_family_flag: boolean;
	fare_family_marketing_name: string;
	duration: number; // in minutes
	segments_count: number;
	type: "regular" | "charter" | "lowcost";
	is_inner_flight: boolean;
	is_baggage: boolean;
	is_charter: boolean;
	is_refund: boolean;
	is_change: boolean;
	is_hide_tariff: boolean;
	is_subsidized: boolean;
	book_url: string;
	citizenships: string[] | null;
	is_vtrip: boolean;
	age_thresholds: {
		infant: { min: number; max: number };
		child: { min: number; max: number };
		adult: { min: number; max: number };
	};
	additional_services: {
		additional_baggage: {
			available: boolean;
		};
	};
	is_health_declaration_checked: boolean;
	is_payment_on_book: boolean;
	provider: {
		gds: number;
		name: string;
		supplier: {
			id: number;
			code: string;
			title: string;
		};
	};

	office_id: string;

	price: {
		[currency: string]: {
			// ← Currency key (RUB, USD, etc.)
			amount: number;
			passengers_amounts: {
				adult?: number;
				child?: number;
				infant?: number;
			};
			agent_mode_prices: {
				total_amount_for_active_agent_mode: number;
				total_amount_for_non_active_agent_mode: number;
				total_partner_affiliate_fee: number;
				debit_from_balance: number;
				passengers_amounts_details: Array<{
					type: "adt" | "chd" | "inf";
					service_amount_for_active_agent_mode: number;
					service_amount_for_non_active_agent_mode: number;
				}>;
			};
			comsa: number;
			partner_affiliate_fee: number;
			start_price: number;
			passengers_amounts_details: Array<{
				type: "adt" | "chd" | "inf";
				amount: number;
				tax: number;
				tariff: number;
				fee: number;
				partner_affiliate_fee: number;
				comsa: number;
			}>;
		};
	};

	price_details: any[]; // not used according to docs
	extra_baggage: any[]; // for low-cost airlines
	segments: FlightSegment[];
	segments_direction: number[][];
	upgrades: FlightUpgrade[];
	pricer_info: Record<string, any>;
	documents: PassengerDocuments;
	ticketing_time_limit: number;
	booking_with_partial_data_allowed: boolean;
	special_tariff_type: string | null;
	is_partner_office: boolean;
	is_discount_code_applied: boolean | null;
}

export interface FlightSegment {
	arr: FlightPoint;
	dep: FlightPoint;
	seats: number;
	flight_number: string;
	direction: number;
	duration: {
		flight: {
			common: number;
			hour: number;
			minute: number;
		};
		transfer?: {
			common: number;
			hour: number;
			minute: number;
		};
	};
	route_duration: number;
	is_baggage: boolean;
	baggage: {
		piece: number;
		weight: number | null;
		dimensions: string | null;
		weight_unit: string | null;
	};
	cbaggage: {
		piece: number;
		weight: number;
		dimensions: string | null;
		weight_unit: string | null;
	};
	accessories?: {
		piece: number;
		weight: number;
		dimensions: {
			width: number;
			length: number;
			height: number;
		};
		weight_unit: string;
	};
	is_refund: boolean;
	is_change: boolean;
	refund: boolean; // outdated
	change: boolean; // outdated
	refundBlock: {
		beforeDeparture: {
			available: boolean;
			isFree: boolean;
			comment: string;
		};
	};
	exchangeBlock: {
		beforeDeparture: {
			available: boolean;
			isFree: boolean;
			comment: string;
		};
	};
	class: {
		type_id: number;
		name: string;
		service: string;
	};
	first: boolean;
	last: boolean;
	fare_code: string;
	carrier: {
		id: number;
		code: string;
		title: string;
	};
	aircraft: {
		code: string;
		title: string;
	};
	stops: FlightStop[];
	miles: string;
	change_miles: string;
	is_mini_rules_exists: boolean;
	is_online_checkin_required: boolean | null;
	brands: string[];
	provider: {
		gds: number;
		name: string;
		supplier: {
			id: number;
			code: string;
			title: string;
		};
	};
	type: string;
	baggage_recheck: boolean;
	comment?: string | null;
	comment_hash?: string;
}

export interface FlightPoint {
	date: string;
	time: string;
	datetime: string;
	ts: number;
	terminal: string;
	airport: {
		id: number;
		title: string;
		short_title: string;
		code: string;
	};
	city: {
		id: number;
		code: string;
		title: string;
	};
	region: {
		id: number | null;
		code: string | null;
		title: string | null;
	};
	country: {
		id: number;
		code: string;
		title: string;
	};
}

export interface FlightStop {
	duration: {
		hour: number;
		minute: number;
	};
	arrival: {
		date: string;
		time: string;
	};
	departure: {
		date: string;
		time: string;
	};
	airport: {
		code: string;
		title: string;
	};
	city: {
		code: string;
		title: string;
	};
	country: {
		code: string;
		title: string;
	};
}

export interface FlightUpgrade {
	id: string;
	key: string | null;
	is_baggage: boolean;
	is_refund: boolean;
	is_change: boolean;
	increase_price: {
		[currency: string]: number;
	};
}

export interface PassengerDocuments {
	adt: {
		ru: string[];
		other: string[];
	};
	chd: {
		ru: string[];
		other: string[];
	};
	inf: {
		ru: string[];
		other: string[];
	};
	ins: {
		ru: string[];
		other: string[];
	};
	src: {
		ru: string[];
		other: string[];
	};
	yth: {
		ru: string[];
		other: string[];
	};
}

// API Response Types
export interface FlightSearchSuccessResponse {
	success: true;
	data: {
		search: {
			inclusion_carriers: any[];
			exclusion_carriers: any[];
			adt: number;
			channel: string;
			chd: number;
			class: string;
			inf: number;
			partner: string;
			segments: Array<{
				from: {
					name: string;
					iata: string;
					country: { name: string; iata: string };
					region: string;
				};
				to: {
					name: string;
					iata: string;
					country: { name: string; iata: string };
					region: string;
				};
				date: string;
			}>;
			src: number;
			token: string;
			type: string;
			yth: number;
			ins: number;
		};
		flights: FlightRecommendation[];
		segments_comments: Record<string, string>;
		health_declaration_text?: string;
		predefined_airlines: any[];
		excluded_airlines: any[];
	};
	count: number;
	searchParams: {
		from: Airport;
		to: Airport;
		departure: string;
		passengers: PassengerCounts;
		class: string;
		tripType: string;
	};
}

export interface FlightSearchErrorResponse {
	success: false;
	error: string;
	errorCode?: number;
	canRetry?: boolean;
	retryDelay?: number;
	pid?: string;
	action?: "retry" | "redirect" | "contact_support" | "fix_input";
	severity?: "low" | "medium" | "high" | "critical";
	category?: string;
}

export type ApiSearchResponse =
	| FlightSearchSuccessResponse
	| FlightSearchErrorResponse;

// Form Data Types (for your existing form)
export interface FlightSearchFormData {
	tripType: TripType;
	fromAirport: Airport | null;
	toAirport: Airport | null;
	departureDate: string;
	returnDate?: string;
	passengers: PassengerCounts;
	travelClass: TravelClass;
	directOnly: boolean;
}

// Search Parameters for API Provider
export interface FlightSearchParams {
	adt: number;
	chd: number;
	inf: number;
	src: number;
	yth: number;
	class: TravelClass;
	segments: Array<{
		from: string;
		to: string;
		date: string;
	}>;
	is_direct_only?: boolean;
	filter_airlines?: string[];
	gds_white_list?: number[];
	gds_black_list?: number[];
	lang: string;
}
