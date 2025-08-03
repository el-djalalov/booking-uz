import {
	DollarSign,
	Calendar,
	Globe,
	Headphones,
	MapPin,
	Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
	{
		icon: DollarSign,
		title: "Best Price Guarantee",
		description:
			"We guarantee the lowest prices on all flights. Find a cheaper deal elsewhere? We'll match it instantly.",
		color: "text-flight-secondary",
	},
	{
		icon: Calendar,
		title: "Flexible Booking",
		description:
			"Change your travel dates without hefty fees. Flexible booking options for all your travel needs.",
		color: "text-flight-primary",
	},
	{
		icon: Globe,
		title: "Global Coverage",
		description:
			"Access to 500+ airlines worldwide. Fly anywhere, anytime with our extensive network of partners.",
		color: "text-flight-accent",
	},
	{
		icon: Headphones,
		title: "24/7 Support",
		description:
			"Round-the-clock customer support in multiple languages. We're here whenever you need us.",
		color: "text-flight-secondary",
	},
	{
		icon: MapPin,
		title: "Easy Destinations",
		description:
			"Discover amazing destinations with our smart search. Find hidden gems and popular spots worldwide.",
		color: "text-flight-primary",
	},
	{
		icon: Users,
		title: "Group Bookings",
		description:
			"Special rates for group travel. Perfect for family vacations, business trips, or group adventures.",
		color: "text-flight-accent",
	},
];

export const Features = () => {
	return (
		<section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-flight-slate to-white">
			<div className="max-w-7xl mx-auto">
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-flight-slate-dark mb-6">
						Why Choose{" "}
						<span className="bg-primary bg-clip-text text-transparent">
							FlightBook
						</span>
						?
					</h2>
					<p className="text-lg text-muted-foreground max-w-3xl mx-auto">
						Experience the future of flight booking with our innovative platform
						designed to make your travel dreams come true.
					</p>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<Card
							key={index}
							className="group hover:shadow-medium transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-flight-slate/20"
						>
							<CardContent className="p-8 text-center">
								<div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-hero">
									<feature.icon className={`h-8 w-8 ${feature.color}`} />
								</div>
								<h3 className="text-xl font-bold text-flight-slate-dark mb-4 group-hover:text-flight-primary transition-colors duration-300">
									{feature.title}
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									{feature.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Stats Section */}
				<div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
					<div className="group">
						<h3 className="text-4xl md:text-5xl font-bold bg-primary bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
							2M+
						</h3>
						<p className="text-muted-foreground font-medium">Happy Travelers</p>
					</div>
					<div className="group">
						<h3 className="text-4xl md:text-5xl font-bold bg-primary bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
							500+
						</h3>
						<p className="text-muted-foreground font-medium">Airlines</p>
					</div>
					<div className="group">
						<h3 className="text-4xl md:text-5xl font-bold bg-primary bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
							1000+
						</h3>
						<p className="text-muted-foreground font-medium">Destinations</p>
					</div>
					<div className="group">
						<h3 className="text-4xl md:text-5xl font-bold bg-primary bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
							60%
						</h3>
						<p className="text-muted-foreground font-medium">Average Savings</p>
					</div>
				</div>
			</div>
		</section>
	);
};
