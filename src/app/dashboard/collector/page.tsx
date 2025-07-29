"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	useMyPendingCases,
	useUpdateCase,
	useDashboardAnalytics,
	useCurrentUser,
	useLogout,
} from "@/queries";
import CaseTable from "@/components/CaseTable";
import AnalyticsChart from "@/components/AnalyticsChart";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import {
	LogOut,
	TrendingUp,
	AlertTriangle,
	CheckCircle,
	XCircle,
} from "lucide-react";

export default function CollectorDashboard() {
	const router = useRouter();
	const [selectedStage, setSelectedStage] = useState<number | undefined>();

	const { data: user } = useCurrentUser();
	const { data: pendingCasesData } = useMyPendingCases({
		page: 1,
		limit: 100,
	});
	const { data: analytics } = useDashboardAnalytics();

	const updateCaseMutation = useUpdateCase();
	const logoutMutation = useLogout();

	const handleViewCase = (caseId: string) => {
		router.push(`/cases/${caseId}`);
	};

	const handleApproveCase = async (caseId: string, remark: string) => {
		try {
			await updateCaseMutation.mutateAsync({
				id: caseId,
				data: { status: "approved", remark },
			});
		} catch (error) {
			console.error("Failed to approve case:", error);
		}
	};

	const handleRejectCase = async (caseId: string, remark: string) => {
		try {
			await updateCaseMutation.mutateAsync({
				id: caseId,
				data: { status: "rejected", remark },
			});
		} catch (error) {
			console.error("Failed to reject case:", error);
		}
	};

	const handleDownloadPDF = async (caseId: string) => {
		try {
			// Call the actual API to get the PDF blob
			const response = await fetch(
				`http://localhost:3033/api/v1/cases/${caseId}/pdf`,
				{
					credentials: "include", // Include cookies for authentication
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to download PDF: ${response.status}`);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `case-${caseId}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to download PDF:", error);
			alert("Failed to download PDF. Please try again.");
		}
	};

	const handleLogout = async () => {
		try {
			await logoutMutation.mutateAsync();
			router.push("/login");
		} catch (error) {
			console.error("Logout failed:", error);
			// Still redirect to login even if logout fails
			router.push("/login");
		}
	};

	if (!user) {
		return <div>Loading...</div>;
	}

	const cases = pendingCasesData?.docs || [];

	// Transform analytics data for charts
	const statusChartData =
		analytics?.statusOverview?.map((item) => ({
			name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
			count: item.count,
			percentage: item.percentage,
		})) || [];

	const delayChartData =
		analytics?.delayAnalysis?.stageDelays?.map((item) => ({
			name: `Stage ${item.stage}`,
			count: item.count,
		})) || [];

	const rejectionChartData =
		analytics?.rejectionAnalysis?.rejectionsByStage?.map((item) => ({
			name: `Stage ${item.stage}`,
			rate: item.rate,
		})) || [];

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
			<Header />

			{/* Main Content */}
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					{/* Sidebar */}
					<div className="lg:col-span-1">
						<Sidebar />
					</div>

					{/* Main Dashboard */}
					<div className="lg:col-span-3 space-y-6">
						{/* Header */}
						<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-6 text-white">
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-3xl font-bold mb-2">
										Collector Dashboard
									</h1>
									<p className="text-emerald-100">Welcome back, {user.name}</p>
								</div>
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

						{/* Analytics Overview */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
							<Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-600">
								<CardContent className="p-4 text-center">
									<div className="flex items-center justify-center mb-2">
										<TrendingUp className="h-8 w-8 text-blue-600" />
									</div>
									<h3 className="text-2xl font-bold text-blue-800">
										{analytics?.totalCases || 0}
									</h3>
									<p className="text-sm text-blue-700">Total Cases</p>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-l-4 border-yellow-600">
								<CardContent className="p-4 text-center">
									<div className="flex items-center justify-center mb-2">
										<AlertTriangle className="h-8 w-8 text-yellow-600" />
									</div>
									<h3 className="text-2xl font-bold text-yellow-800">
										{analytics?.delayAnalysis?.totalDelayed || 0}
									</h3>
									<p className="text-sm text-yellow-700">Delayed Cases</p>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-600">
								<CardContent className="p-4 text-center">
									<div className="flex items-center justify-center mb-2">
										<CheckCircle className="h-8 w-8 text-green-600" />
									</div>
									<h3 className="text-2xl font-bold text-green-800">
										{analytics?.activeCases || 0}
									</h3>
									<p className="text-sm text-green-700">Active Cases</p>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-red-600">
								<CardContent className="p-4 text-center">
									<div className="flex items-center justify-center mb-2">
										<XCircle className="h-8 w-8 text-red-600" />
									</div>
									<h3 className="text-2xl font-bold text-red-800">
										{analytics?.rejectionAnalysis?.totalRejections || 0}
									</h3>
									<p className="text-sm text-red-700">Rejected Cases</p>
								</CardContent>
							</Card>
						</div>

						{/* Charts */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<AnalyticsChart
								data={statusChartData}
								type="bar"
								title="Case Status Distribution"
								dataKey="count"
								nameKey="name"
							/>

							<AnalyticsChart
								data={delayChartData}
								type="pie"
								title="Delayed Cases by Stage"
								dataKey="count"
								nameKey="name"
							/>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<AnalyticsChart
								data={rejectionChartData}
								type="line"
								title="Rejection Rates by Stage"
								dataKey="rate"
								nameKey="name"
							/>

							<Card className="bg-white shadow-lg">
								<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
									<CardTitle className="text-lg">Recent Activity</CardTitle>
								</CardHeader>
								<CardContent className="p-4">
									<div className="space-y-3">
										{analytics?.lastUpdated && (
											<div className="text-sm text-gray-600 mb-4">
												Last Updated:{" "}
												{new Date(analytics.lastUpdated).toLocaleString()}
											</div>
										)}
										{[
											{
												action: "Case Approved",
												case: "RAHAT-2025-001",
												time: "2 hours ago",
											},
											{
												action: "Document Uploaded",
												case: "RAHAT-2025-002",
												time: "4 hours ago",
											},
											{
												action: "Case Rejected",
												case: "RAHAT-2025-003",
												time: "6 hours ago",
											},
											{
												action: "Payment Completed",
												case: "RAHAT-2025-004",
												time: "1 day ago",
											},
										].map((activity, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-2 bg-gray-50 rounded">
												<div>
													<p className="font-medium text-sm">
														{activity.action}
													</p>
													<p className="text-xs text-gray-600">
														{activity.case}
													</p>
												</div>
												<span className="text-xs text-gray-500">
													{activity.time}
												</span>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Cases Table */}
						<CaseTable
							cases={cases}
							userRole="collector"
							onViewCase={handleViewCase}
							onApproveCase={handleApproveCase}
							onRejectCase={handleRejectCase}
							onUploadDocuments={() => {}}
							onCreateCase={() => {}}
							onDownloadPDF={handleDownloadPDF}
							onCloseCase={() => {}}
						/>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
