"use client";

import { Plane, Star, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlightSearch } from "./flight-search";

export const Hero = () => {
	return (
		<>
			<div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-hero pt-12">
				{/* Content */}
				<div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Main Headline */}
					<div className="text-center my-12">
						<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mt-8 leading-tight">
							Find Your Perfect
							<span className="bg-gradient-to-r from-blue-500 via-cyan-500 via-50% to-emerald-600 bg-clip-text text-transparent">
								{" "}
								Flight
							</span>
						</h1>
						<p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
							The best travel experience for your journey.
						</p>
					</div>

					<FlightSearch />

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center mt-36">
						<Button
							size="lg"
							className="h-14 px-8 text-lg font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300 transform hover:scale-105 cursor-pointer"
						>
							Book Now - Save Up to 60%
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="h-14 px-8 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer"
						>
							Explore Destinations
						</Button>
					</div>

					{/* Trust Indicators */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center py-12">
						<div className="flex flex-col items-center gap-2">
							<div className="bg-white/50 backdrop-blur-sm p-3 rounded-full border border-white/40">
								<Star className="h-6 w-6 text-flight-accent" />
							</div>
							<div>
								<p className="font-bold">4.9/5</p>
								<p className="text-sm">Customer Rating</p>
							</div>
						</div>

						<div className="flex flex-col items-center gap-2">
							<div className="bg-white/50 backdrop-blur-sm p-3 rounded-full border border-white/40">
								<Clock className="h-6 w-6 text-flight-accent" />
							</div>
							<div>
								<p className="font-bold">24/7</p>
								<p className="text-sm">Support</p>
							</div>
						</div>

						<div className="flex flex-col items-center gap-2">
							<div className="bg-white/50 backdrop-blur-sm p-3 rounded-full border border-white/40">
								<Shield className="h-6 w-6 text-flight-accent" />
							</div>
							<div>
								<p className="font-bold">100%</p>
								<p className="text-sm">Secure Booking</p>
							</div>
						</div>

						<div className="flex flex-col items-center gap-2">
							<div className="bg-white/50 backdrop-blur-sm p-3 rounded-full border border-white/40">
								<Plane className="h-6 w-6 text-flight-accent" />
							</div>
							<div>
								<p className="font-bold">500+</p>
								<p className="text-sm">Airlines</p>
							</div>
						</div>
					</div>
				</div>

				{/* Scroll Indicator */}
				<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
					<div className="w-6 h-10 border-2 border-flight-primary rounded-full flex justify-center">
						<div className="w-1 h-3 bg-flight-primary rounded-full mt-2 animate-pulse" />
					</div>
				</div>
			</div>
		</>
	);
};
