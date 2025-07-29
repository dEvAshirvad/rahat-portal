export default function Footer() {
	return (
		<footer className="bg-slate-800 text-white py-8 mt-12">
			<div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-slate-300">
				<div>
					<h3 className="font-bold mb-4 text-white">
						District Administration Raipur
					</h3>
					<p>Official portal for RBC 6(4) case resolution</p>
					<p className="mt-2">
						Project Rahat - Financial assistance for unnatural deaths
					</p>
				</div>
				<div>
					<h3 className="font-bold mb-4 text-white">Quick Links</h3>
					<ul className="space-y-2">
						<li>
							<a href="#" className="hover:text-white">
								Chief Minister
							</a>
						</li>
						<li>
							<a href="#" className="hover:text-white">
								Governor
							</a>
						</li>
						<li>
							<a href="#" className="hover:text-white">
								Departments
							</a>
						</li>
						<li>
							<a href="#" className="hover:text-white">
								Schemes
							</a>
						</li>
						<li>
							<a href="#" className="hover:text-white">
								Case Status
							</a>
						</li>
					</ul>
				</div>
				<div>
					<h3 className="font-bold mb-4 text-white">Contact</h3>
					<p>
						Secretariat, Raipur
						<br />
						Chhattisgarh - 492001
						<br />
						Phone: 0771-2234567
						<br />
						Email: rahat@cg.gov.in
					</p>
				</div>
			</div>
			<div className="border-t border-slate-700 mt-8 pt-4 text-center text-sm text-slate-400">
				&copy; 2025 District Administration Raipur. All rights reserved.
			</div>
		</footer>
	);
}
