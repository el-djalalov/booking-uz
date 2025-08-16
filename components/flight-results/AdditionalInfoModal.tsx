import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Info, Printer } from "lucide-react";
import { FlightSearchSuccessResponse } from "@/types/flight-search";

interface AdditionalInfoModalProps {
	apiData: FlightSearchSuccessResponse;
}

const AdditionalInfoModal: React.FC<AdditionalInfoModalProps> = ({
	apiData,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handlePrint = () => {
		const printContents = document.getElementById("print-area")?.innerHTML;
		if (printContents) {
			const originalContents = document.body.innerHTML;
			document.body.innerHTML = printContents;
			window.print();
			document.body.innerHTML = originalContents;
			window.location.reload();
		}
	};

	return (
		<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="p-2 cursor-pointer"
					onClick={() => setIsModalOpen(true)}
				>
					<Info className="h-4 w-4" />
					Health Declaration and Flight Comments
				</Button>
			</DialogTrigger>
			<DialogContent className="min-w-6xl max-h-[90vh]">
				<DialogHeader>
					<DialogTitle className="flex justify-items-start items-center gap-4">
						Additional Flight Information
						<Button variant="outline" size="icon" onClick={handlePrint}>
							<Printer className="h-4 w-4" />
						</Button>
					</DialogTitle>
				</DialogHeader>

				<ScrollArea className="h-[70vh] pr-4">
					<div id="print-area">
						{/* Segments Comments Section */}
						{apiData.data &&
							Object.entries(apiData.data.segments_comments || {}).map(
								([hash, comment]) => (
									<div key={hash} className="mb-4">
										<h3 className="font-semibold text-lg mb-2">
											Segment Comment
										</h3>
										<p className="text-muted-foreground">
											{comment || "No comment available from this segment"}
										</p>
									</div>
								)
							)}

						{/* Health Declaration Section */}
						{apiData.data.health_declaration_text && (
							<div className="mt-6">
								<h3 className="font-semibold text-lg mb-2">
									COVID-19 Health Declaration
								</h3>
								<pre className="text-sm text-muted-foreground">
									{apiData.data.health_declaration_text}
								</pre>
							</div>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

export default AdditionalInfoModal;
