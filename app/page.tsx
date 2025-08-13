import { Features } from "@/components/Features";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-bl from-blue-500/70 via-indigo-500/30  to-green-500/50 via-25%">
			{/* Hero Section */}
			<Hero />

			{/* Features Section */}
			<Features />

			{/* Call to Action Section */}
			<section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-800">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-6">
						Ready to Start Your Journey?
					</h2>
					<p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
						Join millions of travelers who trust us to find the best flight
						deals. Your adventure starts here!
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button className="px-8 py-4 bg-white text-primary font-semibold rounded-lg transition-all duration-300 transform cursor-pointer hover:shadow-lg">
							Start Booking Now
						</button>
						<button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg transition-all duration-300 cursor-pointer hover:bg-white/20">
							Learn More
						</button>
					</div>
				</div>
			</section>
		</div>
	);
}
