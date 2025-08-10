import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu } from "lucide-react";
import { ModeToggle } from "./ThemeSwitcher";

export const Navbar = () => {
	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 dark:bg-transparent border-none">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 bg-transparent rounded-lg flex items-center justify-center">
							<span className="font-bold text-2xl">✈</span>
						</div>
						<span className="text-xl font-bold text-secondary-foreground">
							Safarix
						</span>
					</div>

					{/* Navigation Links */}
					<div className="hidden md:flex items-center gap-8">
						<a
							href="#"
							className="text-flight-slate-dark hover:text-flight-primary transition-colors"
						>
							Home
						</a>
						<a
							href="#"
							className="text-flight-slate-dark hover:text-flight-primary transition-colors"
						>
							Flights
						</a>
						<a
							href="#"
							className="text-flight-slate-dark hover:text-flight-primary transition-colors"
						>
							Hotels
						</a>
						<a
							href="#"
							className="text-flight-slate-dark hover:text-flight-primary transition-colors"
						>
							Deals
						</a>
					</div>

					{/* User Actions */}
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							className="text-flight-slate-dark hover:bg-white/20"
						>
							<Bell className="h-5 w-5" />
						</Button>
						<ModeToggle />
						<Avatar className="h-8 w-8">
							<AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
							<AvatarFallback className="bg-flight-primary text-white text-sm">
								JD
							</AvatarFallback>
						</Avatar>
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden text-flight-slate-dark hover:bg-white/20"
						>
							<Menu className="h-5 w-5" />
						</Button>
					</div>
				</div>
			</div>
		</nav>
	);
};
