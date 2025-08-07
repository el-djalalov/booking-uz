import { Airport } from "@/types/shared";

export interface FlightSearchState {
	showFromSearch: boolean;
	showToSearch: boolean;
	showPassengers: boolean;
	showDatePicker: boolean;
	fromInputText: string;
	toInputText: string;
}

export interface DateRangePickerProps {
	departureDate: string;
	returnDate?: string;
	onDepartureDateChange: (date: string) => void;
	onReturnDateChange: (date: string) => void;
	isRoundTrip: boolean;
	onClose?: () => void;
}

export interface AirportInputProps {
	value: string;
	airport: Airport | null;
	placeholder: string;
	icon: React.ComponentType<{ size?: number; className?: string }>;
	onChange: (value: string) => void;
	onAirportSelect: (airport: Airport) => void;
	onClear: () => void;
	showSearch: boolean;
	onToggleSearch: (show: boolean) => void;
	className?: string;
}
