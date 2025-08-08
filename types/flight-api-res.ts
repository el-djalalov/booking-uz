// types/flight-api-response.ts
export interface FlightApiResponse {
	success: boolean;
	data: {
		search: SearchInfo;
		flights: FlightRecommendation[];
		segments_comments: Record<string, string>;
	};
	count: number;
	searchParams: SearchParams;
}

export interface FlightRecommendation {
	id: string;
	is_tour_operator: boolean;
	tariff: string;
	tariff_class: string;
	fare_family_type: string;
	fare_family_flag: boolean;
	fare_family_marketing_name: string;
	duration: number;
	segments_count: number;
	type: string;
	is_inner_flight: boolean;
	is_baggage: boolean;
	is_charter: boolean;
	is_refund: boolean;
	is_change: boolean;
	is_hide_tariff: boolean;
	is_subsidized: boolean;
	book_url: string;
	citizenships: any;
	is_vtrip: boolean;
	provider: Provider;
	office_id: string;
	price: PriceInfo;
	price_details: any[];
	extra_baggage: any[];
	segments: FlightSegmentApi[];
	segments_direction: number[][];
	upgrades: any[];
	pricer_info: any[];
	documents: Documents;
	ticketing_time_limit: number;
	booking_with_partial_data_allowed: boolean;
	special_tariff_type: any;
	age_thresholds: AgeThresholds;
	is_health_declaration_checked: boolean;
	is_discount_code_applied: boolean;
	is_partner_office: any;
	additional_services: AdditionalServices;
	is_payment_on_book: boolean;
}

export interface PriceInfo {
	[currency: string]: {
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
			passengers_amounts_details: PriceDetail[];
		};
		comsa: number;
		partner_affiliate_fee: number;
		start_price: number;
		passengers_amounts_details: PriceDetail[];
	};
}

export interface PriceDetail {
	type: string;
	amount: number;
	tax: number;
	tariff: number;
	fee: number;
	partner_affiliate_fee: number;
	comsa: number;
}

export interface FlightSegmentApi {
	arr: LocationInfo;
	dep: LocationInfo;
	seats: number;
	flight_number: string;
	direction: number;
	duration: {
		flight: {
			common: number;
			hour: number;
			minute: number;
		};
	};
	route_duration: number;
	is_baggage: boolean;
	baggage: BaggageInfo;
	comment: string;
	comment_hash: string;
	cbaggage: BaggageInfo;
	accessories: BaggageInfo;
	is_refund: boolean;
	is_change: boolean;
	refund: boolean;
	change: boolean;
	refundBlock: RefundBlock;
	exchangeBlock: ExchangeBlock;
	class: ClassInfo;
	first: boolean;
	last: boolean;
	fare_code: string;
	carrier: Carrier;
	marketing_supplier: Carrier;
	validating_carrier: Carrier;
	aircraft: Aircraft;
	stops: any[];
	miles: string;
	change_miles: string;
	is_mini_rules_exists: boolean;
	is_online_checkin_required: any;
	brands: string[];
	baggage_recheck: boolean;
	passenger_baggage: any[];
	provider: Provider;
	type: string;
}

export interface LocationInfo {
	date: string;
	time: string;
	datetime: string;
	ts: number;
	terminal?: string;
	airport: AirportInfo;
	city: CityInfo;
	region: RegionInfo;
	country: CountryInfo;
}

export interface AirportInfo {
	id: number;
	title: string;
	short_title: string;
	code: string;
}

export interface CityInfo {
	id: number;
	code: string;
	title: string;
}

export interface RegionInfo {
	id: number | null;
	code: string | null;
	title: string | null;
}

export interface CountryInfo {
	id: number;
	code: string;
	title: string;
}

export interface BaggageInfo {
	piece: number;
	weight: number | null;
	dimensions: string | null;
	weight_unit: string | null;
}

export interface ClassInfo {
	type_id: number;
	name: string;
	service: string;
}

export interface Carrier {
	id: number;
	code: string;
	title: string;
}

export interface Aircraft {
	code: string;
	title: string;
}

export interface Provider {
	gds: number;
	name: string;
	supplier: Carrier;
}

export interface RefundBlock {
	beforeDeparture: {
		available: boolean;
		isFree: any;
		comment: any;
	};
}

export interface ExchangeBlock {
	beforeDeparture: {
		available: boolean;
		isFree: any;
		comment: any;
	};
}

export interface Documents {
	adt: DocumentRequirement;
	chd: DocumentRequirement;
	inf: DocumentRequirement;
	ins: DocumentRequirement;
	src: DocumentRequirement;
	yth: DocumentRequirement;
}

export interface DocumentRequirement {
	ru: string[];
	kz: string[];
	other: string[];
}

export interface AgeThresholds {
	infant: { min: number; max: number };
	child: { min: number; max: number };
	adult: { min: number; max: number };
}

export interface AdditionalServices {
	additional_baggage: {
		available: boolean;
	};
}

export interface SearchInfo {
	inclusion_carriers: any[];
	exclusion_carriers: any[];
	adt: number;
	channel: string;
	chd: number;
	class: string;
	inf: number;
	partner: string;
	segments: SearchSegment[];
	src: number;
	token: string;
	type: string;
	yth: number;
	ins: number;
}

export interface SearchSegment {
	from: SearchLocation;
	to: SearchLocation;
	date: string;
}

export interface SearchLocation {
	name: string;
	iata: string;
	country: {
		name: string;
		iata: string;
	};
	region: string;
}

export interface SearchParams {
	from: SearchLocation;
	to: SearchLocation;
	departure: string;
	passengers: {
		adults: number;
		children: number;
		infants: number;
	};
	class: string;
	tripType: string;
}
