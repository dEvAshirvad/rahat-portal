"use client";

export default function Header() {
	return (
		<>
			{/* Header */}
			<header className="bg-gradient-to-r from-orange-500 via-white to-green-600 shadow-lg border-b-4 border-amber-500 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 via-white/95 to-green-600/90"></div>
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-blue-100/50"></div>

				<div className="container mx-auto px-4 py-4 relative z-10">
					<div className="flex items-center justify-between">
						{/* Logos and Title */}
						<div className="flex items-center space-x-4">
							<div>
								<h1 className="text-2xl font-bold text-blue-900 drop-shadow-md">
									प्रोजेक्ट राहत
								</h1>
								<p className="text-sm text-red-700 font-medium drop-shadow-sm">
									PROJECT RAHAT | District Administration Raipur
								</p>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Marquee Banner */}
			<div className="bg-gradient-to-r from-amber-600 via-red-700 to-amber-600 text-white shadow-lg border-b-2 border-amber-400">
				<div className="flex items-center">
					<div className="bg-emerald-800 px-6 py-4 font-bold text-sm flex items-center space-x-2 shadow-lg">
						<span className="text-amber-300">🏛️</span>
						<span>CG GOVERNMENT SCHEMES</span>
					</div>
					<div className="flex-1 py-4 overflow-hidden">
						<div className="animate-marquee whitespace-nowrap text-sm font-medium">
							{[
								[
									"मुख्यमंत्री कन्या विवाह योजना",
									"Financial assistance for girl child marriage",
								],
								[
									"राजीव गांधी किसान न्याय योजना",
									"Direct cash transfer to farmers",
								],
								["गोधन न्याय योजना", "Cow dung procurement scheme"],
								["सुराजी गांव योजना", "Rural development program"],
								[
									"मुख्यमंत्री स्लम स्वास्थ्य योजना",
									"Healthcare for slum dwellers",
								],
								["छत्तीसगढ़ मितान योजना", "Doorstep service delivery"],
								["मुख्यमंत्री वृक्ष संपदा योजना", "Tree wealth scheme"],
								["दाई-दीदी क्लिनिक योजना", "Women healthcare initiative"],
								["छत्तीसगढ़ धान बोनस योजना", "Paddy bonus scheme"],
								[
									"मुख्यमंत्री युवा उद्यमी योजना",
									"Youth entrepreneurship program",
								],
							].map(([title, desc], idx) => (
								<span key={idx} className="mx-8">
									<span className="text-amber-300 font-bold">{title}</span> -{" "}
									{desc}
								</span>
							))}
						</div>
					</div>
					<div className="bg-emerald-800 px-4 py-4 text-xs text-center">
						<div className="text-amber-300 font-bold">Apply Online</div>
						<div>cgstate.gov.in</div>
					</div>
				</div>
			</div>
		</>
	);
}
