"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	useDashboardAnalytics,
	useCases,
	useCurrentUser,
	useLogout,
} from "@/queries";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
	AreaChart,
	Area,
} from "recharts";
import {
	TrendingUp,
	Users,
	FileText,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	Download,
	Filter,
	Calendar,
	MapPin,
	Phone,
	LogOut,
} from "lucide-react";

const COLORS = [
	"#0088FE",
	"#00C49F",
	"#FFBB28",
	"#FF8042",
	"#8884D8",
	"#82CA9D",
];

export default function AnalyticsDashboard() {
	const [dateRange, setDateRange] = useState("30");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [selectedStage, setSelectedStage] = useState("all");
	const [showFilters, setShowFilters] = useState(false);

	const { data: analytics } = useDashboardAnalytics();
	const { data: casesData } = useCases({ limit: 1000 });
	const { data: user } = useCurrentUser();
	const logoutMutation = useLogout();

	const cases = casesData?.cases || [];

	// Filter cases based on selected criteria
	const filteredCases = cases.filter((caseItem) => {
		const statusMatch =
			selectedStatus === "all" || caseItem.status === selectedStatus;
		const stageMatch =
			selectedStage === "all" || caseItem.stage.toString() === selectedStage;

		// Date filtering
		const caseDate = new Date(caseItem.createdAt || caseItem.updatedAt);
		const daysAgo = Math.floor(
			(Date.now() - caseDate.getTime()) / (1000 * 60 * 60 * 24)
		);
		const dateMatch = dateRange === "all" || daysAgo <= parseInt(dateRange);

		return statusMatch && stageMatch && dateMatch;
	});

	// Prepare data for charts
	const statusData = [
		{
			name: "Created",
			value: filteredCases.filter((c) => c.status === "created").length,
			color: "#0088FE",
		},
		{
			name: "Pending",
			value: filteredCases.filter((c) => c.status === "pending").length,
			color: "#FFBB28",
		},
		{
			name: "Approved",
			value: filteredCases.filter((c) => c.status === "approved").length,
			color: "#00C49F",
		},
		{
			name: "Rejected",
			value: filteredCases.filter((c) => c.status === "rejected").length,
			color: "#FF8042",
		},
		{
			name: "Closed",
			value: filteredCases.filter((c) => c.status === "closed").length,
			color: "#8884D8",
		},
	];

	const stageData = [
		{
			name: "Stage 1",
			value: filteredCases.filter((c) => c.stage === 1).length,
		},
		{
			name: "Stage 2",
			value: filteredCases.filter((c) => c.stage === 2).length,
		},
		{
			name: "Stage 3",
			value: filteredCases.filter((c) => c.stage === 3).length,
		},
		{
			name: "Stage 4",
			value: filteredCases.filter((c) => c.stage === 4).length,
		},
		{
			name: "Stage 5",
			value: filteredCases.filter((c) => c.stage === 5).length,
		},
		{
			name: "Stage 6",
			value: filteredCases.filter((c) => c.stage === 6).length,
		},
		{
			name: "Stage 7",
			value: filteredCases.filter((c) => c.stage === 7).length,
		},
		{
			name: "Stage 8",
			value: filteredCases.filter((c) => c.stage === 8).length,
		},
		{
			name: "Stage 9",
			value: filteredCases.filter((c) => c.stage === 9).length,
		},
	];

	// Monthly trend data
	const monthlyData = Array.from({ length: 12 }, (_, i) => {
		const month = new Date();
		month.setMonth(month.getMonth() - (11 - i));
		const monthCases = filteredCases.filter((c) => {
			const caseDate = new Date(c.createdAt || c.updatedAt);
			return (
				caseDate.getMonth() === month.getMonth() &&
				caseDate.getFullYear() === month.getFullYear()
			);
		});
		return {
			month: month.toLocaleDateString("en-US", { month: "short" }),
			cases: monthCases.length,
			approved: monthCases.filter((c) => c.status === "approved").length,
			pending: monthCases.filter((c) => c.status === "pending").length,
		};
	});

	// Department-wise distribution
	const departmentData = [
		{
			name: "Tehsildar",
			cases: filteredCases.filter((c) => c.stage <= 3).length,
		},
		{ name: "SDM", cases: filteredCases.filter((c) => c.stage === 4).length },
		{
			name: "Rahat Shakha",
			cases: filteredCases.filter((c) => c.stage === 5).length,
		},
		{ name: "OIC", cases: filteredCases.filter((c) => c.stage === 6).length },
		{
			name: "Additional Collector",
			cases: filteredCases.filter((c) => c.stage === 7).length,
		},
		{
			name: "Collector",
			cases: filteredCases.filter((c) => c.stage === 8).length,
		},
	];

	const handleLogout = async () => {
		try {
			await logoutMutation.mutateAsync();
			window.location.href = "/login";
		} catch (error) {
			console.error("Logout failed:", error);
			window.location.href = "/login";
		}
	};

	const exportData = () => {
		const csvContent = [
			[
				"Case ID",
				"Victim Name",
				"Status",
				"Stage",
				"Created Date",
				"Contact",
				"Address",
			],
			...filteredCases.map((c) => [
				c.caseId,
				c.victim?.name || "N/A",
				c.status,
				c.stage,
				new Date(c.createdAt || c.updatedAt).toLocaleDateString(),
				c.victim?.contact || "N/A",
				c.victim?.address || "N/A",
			]),
		]
			.map((row) => row.join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `cases-analytics-${
			new Date().toISOString().split("T")[0]
		}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	};

	if (!user) {
		return <div>Loading...</div>;
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
			<Header />

			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					{/* Sidebar */}
					<div className="lg:col-span-1">
						<Sidebar />
					</div>

					{/* Main Content */}
					<div className="lg:col-span-3 space-y-6">
						{/* Header */}
						<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-3xl font-bold mb-2">
										Analytics Dashboard
									</h1>
									<p className="text-emerald-100">
										Comprehensive analysis of all cases
									</p>
									<p className="text-sm text-emerald-200">
										Welcome back, {user.name}
									</p>
								</div>
								<div className="flex space-x-2">
									<Button
										onClick={exportData}
										variant="outline"
										className="text-white border-white hover:bg-white hover:text-slate-800">
										<Download className="h-4 w-4 mr-2" />
										Export Data
									</Button>
									<Button
										onClick={() => setShowFilters(!showFilters)}
										variant="outline"
										className="text-white border-white hover:bg-white hover:text-slate-800">
										<Filter className="h-4 w-4 mr-2" />
										Filters
									</Button>
									<Button
										onClick={handleLogout}
										disabled={logoutMutation.isPending}
										variant="outline"
										className="text-white border-white hover:bg-white hover:text-slate-800">
										<LogOut className="h-4 w-4 mr-2" />
										{logoutMutation.isPending ? "Logging out..." : "Logout"}
									</Button>
								</div>
							</div>
						</div>

						{/* Filters */}
						{showFilters && (
							<Card className="bg-white shadow-lg">
								<CardHeader>
									<CardTitle className="flex items-center">
										<Filter className="h-5 w-5 mr-2" />
										Filters
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="text-sm font-medium">Date Range</label>
											<select
												className="w-full p-2 border rounded mt-1"
												value={dateRange}
												onChange={(e) => setDateRange(e.target.value)}>
												<option value="7">Last 7 days</option>
												<option value="30">Last 30 days</option>
												<option value="90">Last 90 days</option>
												<option value="365">Last year</option>
												<option value="all">All time</option>
											</select>
										</div>
										<div>
											<label className="text-sm font-medium">Status</label>
											<select
												className="w-full p-2 border rounded mt-1"
												value={selectedStatus}
												onChange={(e) => setSelectedStatus(e.target.value)}>
												<option value="all">All Status</option>
												<option value="created">Created</option>
												<option value="pending">Pending</option>
												<option value="approved">Approved</option>
												<option value="rejected">Rejected</option>
												<option value="closed">Closed</option>
											</select>
										</div>
										<div>
											<label className="text-sm font-medium">Stage</label>
											<select
												className="w-full p-2 border rounded mt-1"
												value={selectedStage}
												onChange={(e) => setSelectedStage(e.target.value)}>
												<option value="all">All Stages</option>
												<option value="1">Stage 1</option>
												<option value="2">Stage 2</option>
												<option value="3">Stage 3</option>
												<option value="4">Stage 4</option>
												<option value="5">Stage 5</option>
												<option value="6">Stage 6</option>
												<option value="7">Stage 7</option>
												<option value="8">Stage 8</option>
												<option value="9">Stage 9</option>
											</select>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Key Metrics */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-600">
								<CardContent className="p-4">
									<div className="flex items-center">
										<FileText className="h-8 w-8 text-blue-600 mr-3" />
										<div>
											<p className="text-sm text-blue-600">Total Cases</p>
											<p className="text-2xl font-bold text-blue-800">
												{filteredCases.length}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-l-4 border-yellow-600">
								<CardContent className="p-4">
									<div className="flex items-center">
										<Clock className="h-8 w-8 text-yellow-600 mr-3" />
										<div>
											<p className="text-sm text-yellow-600">Pending Cases</p>
											<p className="text-2xl font-bold text-yellow-800">
												{
													filteredCases.filter((c) => c.status === "pending")
														.length
												}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-600">
								<CardContent className="p-4">
									<div className="flex items-center">
										<CheckCircle className="h-8 w-8 text-green-600 mr-3" />
										<div>
											<p className="text-sm text-green-600">Approved Cases</p>
											<p className="text-2xl font-bold text-green-800">
												{
													filteredCases.filter((c) => c.status === "approved")
														.length
												}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-red-600">
								<CardContent className="p-4">
									<div className="flex items-center">
										<XCircle className="h-8 w-8 text-red-600 mr-3" />
										<div>
											<p className="text-sm text-red-600">Rejected Cases</p>
											<p className="text-2xl font-bold text-red-800">
												{
													filteredCases.filter((c) => c.status === "rejected")
														.length
												}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Charts Row 1 */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Status Distribution */}
							<Card className="bg-white shadow-lg">
								<CardHeader>
									<CardTitle>Case Status Distribution</CardTitle>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={300}>
										<PieChart>
											<Pie
												data={statusData}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={({ name, percent }) =>
													`${name} ${((percent || 0) * 100).toFixed(0)}%`
												}
												outerRadius={80}
												fill="#8884d8"
												dataKey="value">
												{statusData.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={entry.color} />
												))}
											</Pie>
											<Tooltip />
										</PieChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>

							{/* Stage Distribution */}
							<Card className="bg-white shadow-lg">
								<CardHeader>
									<CardTitle>Case Stage Distribution</CardTitle>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={300}>
										<BarChart data={stageData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" />
											<YAxis />
											<Tooltip />
											<Bar dataKey="value" fill="#8884d8" />
										</BarChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>
						</div>

						{/* Charts Row 2 */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Monthly Trend */}
							<Card className="bg-white shadow-lg">
								<CardHeader>
									<CardTitle>Monthly Case Trend</CardTitle>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={300}>
										<AreaChart data={monthlyData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="month" />
											<YAxis />
											<Tooltip />
											<Area
												type="monotone"
												dataKey="cases"
												stackId="1"
												stroke="#8884d8"
												fill="#8884d8"
											/>
											<Area
												type="monotone"
												dataKey="approved"
												stackId="1"
												stroke="#82ca9d"
												fill="#82ca9d"
											/>
											<Area
												type="monotone"
												dataKey="pending"
												stackId="1"
												stroke="#ffc658"
												fill="#ffc658"
											/>
										</AreaChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>

							{/* Department Distribution */}
							<Card className="bg-white shadow-lg">
								<CardHeader>
									<CardTitle>Department-wise Case Distribution</CardTitle>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={300}>
										<BarChart data={departmentData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis
												dataKey="name"
												angle={-45}
												textAnchor="end"
												height={80}
											/>
											<YAxis />
											<Tooltip />
											<Bar dataKey="cases" fill="#82ca9d" />
										</BarChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>
						</div>

						{/* Recent Cases Table */}
						<Card className="bg-white shadow-lg">
							<CardHeader>
								<CardTitle>Recent Cases</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b">
												<th className="text-left p-2">Case ID</th>
												<th className="text-left p-2">Victim Name</th>
												<th className="text-left p-2">Status</th>
												<th className="text-left p-2">Stage</th>
												<th className="text-left p-2">Created Date</th>
												<th className="text-left p-2">Contact</th>
											</tr>
										</thead>
										<tbody>
											{filteredCases.slice(0, 10).map((caseItem, index) => (
												<tr key={index} className="border-b hover:bg-gray-50">
													<td className="p-2 font-mono text-sm">
														{caseItem.caseId}
													</td>
													<td className="p-2">
														{caseItem.victim?.name || "N/A"}
													</td>
													<td className="p-2">
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${
																caseItem.status === "approved"
																	? "bg-green-100 text-green-800"
																	: caseItem.status === "pending"
																	? "bg-yellow-100 text-yellow-800"
																	: caseItem.status === "rejected"
																	? "bg-red-100 text-red-800"
																	: "bg-gray-100 text-gray-800"
															}`}>
															{caseItem.status}
														</span>
													</td>
													<td className="p-2">
														<span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
															Stage {caseItem.stage}
														</span>
													</td>
													<td className="p-2 text-sm">
														{new Date(
															caseItem.createdAt || caseItem.updatedAt
														).toLocaleDateString()}
													</td>
													<td className="p-2 text-sm">
														{caseItem.victim?.contact || "N/A"}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>

						{/* Analytics Summary */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card className="bg-white shadow-lg">
								<CardHeader>
									<CardTitle className="flex items-center">
										<TrendingUp className="h-5 w-5 mr-2" />
										Performance Metrics
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="text-sm text-gray-600">Approval Rate</p>
										<p className="text-2xl font-bold text-green-600">
											{filteredCases.length > 0
												? (
														(filteredCases.filter(
															(c) => c.status === "approved"
														).length /
															filteredCases.length) *
														100
												  ).toFixed(1)
												: 0}
											%
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">
											Average Processing Time
										</p>
										<p className="text-2xl font-bold text-blue-600">
											{analytics?.averageResolutionTime || "N/A"} days
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Cases This Month</p>
										<p className="text-2xl font-bold text-purple-600">
											{monthlyData[monthlyData.length - 1]?.cases || 0}
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-white shadow-lg">
								<CardHeader>
									<CardTitle className="flex items-center">
										<Users className="h-5 w-5 mr-2" />
										Demographics
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="text-sm text-gray-600">Total Victims</p>
										<p className="text-2xl font-bold text-indigo-600">
											{filteredCases.length}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Active Cases</p>
										<p className="text-2xl font-bold text-orange-600">
											{
												filteredCases.filter(
													(c) =>
														c.status === "pending" || c.status === "created"
												).length
											}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Completed Cases</p>
										<p className="text-2xl font-bold text-green-600">
											{
												filteredCases.filter((c) => c.status === "closed")
													.length
											}
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-white shadow-lg">
								<CardHeader>
									<CardTitle className="flex items-center">
										<AlertCircle className="h-5 w-5 mr-2" />
										Alerts
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="text-sm text-gray-600">Delayed Cases</p>
										<p className="text-2xl font-bold text-red-600">
											{analytics?.delayAnalysis?.totalDelayed || 0}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Active Cases</p>
										<p className="text-2xl font-bold text-yellow-600">
											{analytics?.activeCases || 0}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Rejection Rate</p>
										<p className="text-2xl font-bold text-red-600">
											{filteredCases.length > 0
												? (
														(filteredCases.filter(
															(c) => c.status === "rejected"
														).length /
															filteredCases.length) *
														100
												  ).toFixed(1)
												: 0}
											%
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
