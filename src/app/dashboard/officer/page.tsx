"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	useMyPendingCases,
	useUpdateCase,
	useCloseCase,
	useUploadDocuments,
	useCreateCase,
	useCurrentUser,
	useLogout,
	useMemberInfo,
	useUploadFile,
	useMembersByRole,
} from "@/queries";
import CaseTable from "@/components/CaseTable";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import { LogOut, X } from "lucide-react";

export default function OfficerDashboard() {
	const router = useRouter();
	const [userRole, setUserRole] = useState<string>("");
	const [selectedStage, setSelectedStage] = useState<number | undefined>();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [selectedCaseId, setSelectedCaseId] = useState<string>("");
	const [patwariFiles, setPatwariFiles] = useState<File[]>([]);
	const [tiFiles, setTiFiles] = useState<File[]>([]);
	const [uploadingFiles, setUploadingFiles] = useState(false);

	// Create case form state
	const [createCaseForm, setCreateCaseForm] = useState({
		name: "",
		dob: "",
		dod: "",
		address: "",
		contact: "",
		description: "",
		caseSDM: "",
	});

	const { data: user } = useCurrentUser();
	const { data: member } = useMemberInfo();
	const { data: pendingCasesData } = useMyPendingCases({
		page: 1,
		limit: 100,
	});
	const { data: sdmMembers } = useMembersByRole("sdm");

	const updateCaseMutation = useUpdateCase();
	const closeCaseMutation = useCloseCase();
	const uploadDocumentsMutation = useUploadDocuments();
	const createCaseMutation = useCreateCase();
	const uploadFileMutation = useUploadFile();
	const logoutMutation = useLogout();

	useEffect(() => {
		if (member) {
			setUserRole(member.role);
		}
	}, [member]);

	// Set default SDM when members are loaded
	useEffect(() => {
		if (
			sdmMembers?.docs &&
			sdmMembers.docs.length > 0 &&
			!createCaseForm.caseSDM
		) {
			setCreateCaseForm((prev) => ({
				...prev,
				caseSDM: sdmMembers.docs[0].userId,
			}));
		}
	}, [sdmMembers, createCaseForm.caseSDM]);

	const getRoleTitle = (role: string) => {
		const titles = {
			tehsildar: "Tehsildar Dashboard",
			sdm: "SDM Dashboard",
			"rahat-shakha": "Rahat Shakha Dashboard",
			oic: "OIC Dashboard",
			"additional-collector": "Additional Collector Dashboard",
			collector: "Collector Dashboard",
			user: "Officer Dashboard",
			admin: "Collector Dashboard",
		};
		return titles[role as keyof typeof titles] || "Officer Dashboard";
	};

	const getStageFilter = (role: string) => {
		const stageMap = {
			tehsildar: [1, 2, 3, 9],
			sdm: [4],
			"rahat-shakha": [5],
			oic: [6],
			"additional-collector": [7],
			collector: [8],
		};
		return (
			stageMap[role as keyof typeof stageMap] || [1, 2, 3, 4, 5, 6, 7, 8, 9]
		);
	};

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

	const handleUploadDocuments = async (caseId: string) => {
		setSelectedCaseId(caseId);
		setShowUploadModal(true);
	};

	const handleFileUpload = async () => {
		if (
			!selectedCaseId ||
			(patwariFiles.length === 0 && tiFiles.length === 0)
		) {
			alert("Please select files to upload");
			return;
		}

		setUploadingFiles(true);
		try {
			const patwariUrls: string[] = [];
			const tiUrls: string[] = [];

			// Upload Patwari files
			for (const file of patwariFiles) {
				const uploadResult = await uploadFileMutation.mutateAsync({
					file,
					entityType: "other",
					uploadedFor: selectedCaseId,
					description: `Patwari document for case ${selectedCaseId}`,
					tags: ["patwari", "case-document"],
				});
				patwariUrls.push(uploadResult.fileUrl);
			}

			// Upload TI files
			for (const file of tiFiles) {
				const uploadResult = await uploadFileMutation.mutateAsync({
					file,
					entityType: "other",
					uploadedFor: selectedCaseId,
					description: `TI document for case ${selectedCaseId}`,
					tags: ["ti", "case-document"],
				});
				tiUrls.push(uploadResult.fileUrl);
			}

			// Upload documents to case
			await uploadDocumentsMutation.mutateAsync({
				id: selectedCaseId,
				data: {
					patwari: patwariUrls,
					ti: tiUrls,
				},
			});

			alert("Documents uploaded successfully!");
			setShowUploadModal(false);
			setPatwariFiles([]);
			setTiFiles([]);
		} catch (error) {
			console.error("Failed to upload documents:", error);
			alert("Failed to upload documents");
		} finally {
			setUploadingFiles(false);
		}
	};

	const handleCreateCase = () => {
		setShowCreateModal(true);
	};

	const handleCreateCaseSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate required fields
		if (
			!createCaseForm.name ||
			!createCaseForm.dob ||
			!createCaseForm.dod ||
			!createCaseForm.address ||
			!createCaseForm.contact ||
			!createCaseForm.description ||
			!createCaseForm.caseSDM
		) {
			alert("Please fill in all required fields");
			return;
		}

		try {
			const result = await createCaseMutation.mutateAsync(createCaseForm);
			alert(`Case created successfully! Case ID: ${result.caseId}`);
			setShowCreateModal(false);
			setCreateCaseForm({
				name: "",
				dob: "",
				dod: "",
				address: "",
				contact: "",
				description: "",
				caseSDM: "",
			});
		} catch (error) {
			console.error("Failed to create case:", error);
			alert("Failed to create case");
		}
	};

	const handleDownloadPDF = async (caseId: string) => {
		try {
			// Call the actual API to get the PDF blob
			const response = await fetch(
				`${
					process.env.NEXT_PUBLIC_CASES_API_URL || "http://localhost:3033"
				}/api/v1/cases/${caseId}/pdf`,
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

	const handleCloseCase = async (caseId: string, paymentRemark: string) => {
		try {
			await closeCaseMutation.mutateAsync({
				id: caseId,
				data: { paymentRemark },
			});
		} catch (error) {
			console.error("Failed to close case:", error);
		}
	};

	const handleLogout = async () => {
		try {
			await logoutMutation.mutateAsync();
			router.push("/login");
		} catch (error) {
			console.error("Logout failed:", error);
			router.push("/login");
		}
	};

	if (!user || !member) {
		return <div>Loading...</div>;
	}

	const roleTitle = getRoleTitle(member.role);
	const stageFilters = getStageFilter(member.role);
	const cases = pendingCasesData?.docs || [];

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
									<h1 className="text-3xl font-bold mb-2">{roleTitle}</h1>
									<p className="text-emerald-100">Welcome back, {user.name}</p>
									<p className="text-sm text-emerald-200">
										Role: {member.role} • Department: {member.departmentSlug}
									</p>
								</div>
								<Button
									onClick={handleLogout}
									disabled={logoutMutation.isPending}>
									<LogOut className="h-4 w-4 mr-2" />
									{logoutMutation.isPending ? "Logging out..." : "Logout"}
								</Button>
							</div>
						</div>

						{/* Stats Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-600">
								<CardContent className="p-4 text-center">
									<h3 className="text-2xl font-bold text-blue-800">
										{cases.filter((c) => c.status === "pending").length}
									</h3>
									<p className="text-sm text-blue-700">Pending Cases</p>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-600">
								<CardContent className="p-4 text-center">
									<h3 className="text-2xl font-bold text-green-800">
										{cases.filter((c) => c.status === "approved").length}
									</h3>
									<p className="text-sm text-green-700">Approved Cases</p>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-600">
								<CardContent className="p-4 text-center">
									<h3 className="text-2xl font-bold text-amber-800">
										{cases.length}
									</h3>
									<p className="text-sm text-amber-700">Total Cases</p>
								</CardContent>
							</Card>
						</div>

						{/* Cases Table */}
						<CaseTable
							cases={cases}
							userRole={member.role}
							onViewCase={handleViewCase}
							onApproveCase={handleApproveCase}
							onRejectCase={handleRejectCase}
							onUploadDocuments={handleUploadDocuments}
							onCreateCase={handleCreateCase}
							onDownloadPDF={handleDownloadPDF}
							onCloseCase={handleCloseCase}
						/>
					</div>
				</div>
			</div>

			<Footer />

			{/* Create Case Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<Card className="w-full max-w-2xl mx-4">
						<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white flex justify-between items-center">
							<CardTitle className="text-xl">Create New Case</CardTitle>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShowCreateModal(false)}
								className="text-white hover:bg-white/20">
								<X className="h-5 w-5" />
							</Button>
						</CardHeader>
						<CardContent className="p-6">
							<form onSubmit={handleCreateCaseSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium">Victim Name *</label>
										<input
											type="text"
											className="w-full p-2 border rounded mt-1"
											placeholder="Enter victim name"
											value={createCaseForm.name}
											onChange={(e) =>
												setCreateCaseForm({
													...createCaseForm,
													name: e.target.value,
												})
											}
											required
										/>
									</div>
									<div>
										<label className="text-sm font-medium">
											Date of Birth *
										</label>
										<input
											type="date"
											className="w-full p-2 border rounded mt-1"
											value={createCaseForm.dob}
											onChange={(e) =>
												setCreateCaseForm({
													...createCaseForm,
													dob: e.target.value,
												})
											}
											required
										/>
									</div>
									<div>
										<label className="text-sm font-medium">
											Date of Death *
										</label>
										<input
											type="date"
											className="w-full p-2 border rounded mt-1"
											value={createCaseForm.dod}
											onChange={(e) =>
												setCreateCaseForm({
													...createCaseForm,
													dod: e.target.value,
												})
											}
											required
										/>
									</div>
									<div>
										<label className="text-sm font-medium">
											Contact Number *
										</label>
										<input
											type="tel"
											className="w-full p-2 border rounded mt-1"
											placeholder="Enter contact number"
											value={createCaseForm.contact}
											onChange={(e) =>
												setCreateCaseForm({
													...createCaseForm,
													contact: e.target.value,
												})
											}
											required
										/>
									</div>
								</div>
								<div>
									<label className="text-sm font-medium">Address *</label>
									<textarea
										className="w-full p-2 border rounded mt-1"
										rows={3}
										placeholder="Enter address"
										value={createCaseForm.address}
										onChange={(e) =>
											setCreateCaseForm({
												...createCaseForm,
												address: e.target.value,
											})
										}
										required
									/>
								</div>
								<div>
									<label className="text-sm font-medium">Description *</label>
									<textarea
										className="w-full p-2 border rounded mt-1"
										rows={3}
										placeholder="Enter case description"
										value={createCaseForm.description}
										onChange={(e) =>
											setCreateCaseForm({
												...createCaseForm,
												description: e.target.value,
											})
										}
										required
									/>
								</div>
								<div>
									<label className="text-sm font-medium">Assign SDM *</label>
									<select
										className="w-full p-2 border rounded mt-1"
										value={createCaseForm.caseSDM}
										onChange={(e) =>
											setCreateCaseForm({
												...createCaseForm,
												caseSDM: e.target.value,
											})
										}
										required>
										<option value="">Select SDM</option>
										{sdmMembers?.docs?.map((sdm) => (
											<option key={sdm._id} value={sdm.userId}>
												{sdm.user.name} - {sdm.user.email}
											</option>
										))}
									</select>
								</div>
								<div className="flex space-x-2">
									<Button
										type="submit"
										disabled={createCaseMutation.isPending}
										className="flex-1 bg-green-600 hover:bg-green-700">
										{createCaseMutation.isPending
											? "Creating..."
											: "Create Case"}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => setShowCreateModal(false)}>
										Cancel
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Upload Documents Modal */}
			{showUploadModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<Card className="w-full max-w-md mx-4">
						<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white flex justify-between items-center">
							<CardTitle className="text-xl">Upload Documents</CardTitle>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShowUploadModal(false)}
								className="text-white hover:bg-white/20">
								<X className="h-5 w-5" />
							</Button>
						</CardHeader>
						<CardContent className="p-6">
							<div className="space-y-4">
								<div>
									<label className="text-sm font-medium">
										Patwari Documents
									</label>
									<input
										type="file"
										multiple
										className="w-full p-2 border rounded mt-1"
										accept=".pdf,.jpg,.jpeg,.png"
										onChange={(e) =>
											setPatwariFiles(Array.from(e.target.files || []))
										}
									/>
									{patwariFiles.length > 0 && (
										<p className="text-sm text-gray-600 mt-1">
											{patwariFiles.length} file(s) selected
										</p>
									)}
								</div>
								<div>
									<label className="text-sm font-medium">TI Documents</label>
									<input
										type="file"
										multiple
										className="w-full p-2 border rounded mt-1"
										accept=".pdf,.jpg,.jpeg,.png"
										onChange={(e) =>
											setTiFiles(Array.from(e.target.files || []))
										}
									/>
									{tiFiles.length > 0 && (
										<p className="text-sm text-gray-600 mt-1">
											{tiFiles.length} file(s) selected
										</p>
									)}
								</div>
								<div className="flex space-x-2">
									<Button
										onClick={handleFileUpload}
										disabled={uploadingFiles}
										className="flex-1 bg-green-600 hover:bg-green-700">
										{uploadingFiles ? "Uploading..." : "Upload"}
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setShowUploadModal(false);
											setPatwariFiles([]);
											setTiFiles([]);
										}}>
										Cancel
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
