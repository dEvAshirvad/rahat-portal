"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	useCase,
	useUpdateCase,
	useCloseCase,
	useUploadDocuments,
	useUploadFile,
} from "@/queries";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import {
	ArrowLeft,
	Download,
	Upload,
	Check,
	X,
	FileText,
	Clock,
	User,
	Calendar,
	MapPin,
	Phone,
	MessageSquare,
} from "lucide-react";

interface CaseSingleDetailsProps {
	params: Promise<{ caseId: string }>;
}
export default function CaseSingleDetails({ params }: CaseSingleDetailsProps) {
	const { caseId } = use(params);
	const router = useRouter();
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [showApproveModal, setShowApproveModal] = useState(false);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [showCloseModal, setShowCloseModal] = useState(false);
	const [remark, setRemark] = useState("");
	const [paymentRemark, setPaymentRemark] = useState("");
	const [patwariFiles, setPatwariFiles] = useState<File[]>([]);
	const [tiFiles, setTiFiles] = useState<File[]>([]);
	const [uploadingFiles, setUploadingFiles] = useState(false);

	const { data: caseData, isLoading, error } = useCase(caseId);
	const updateCaseMutation = useUpdateCase();
	const closeCaseMutation = useCloseCase();
	const uploadDocumentsMutation = useUploadDocuments();
	const uploadFileMutation = useUploadFile();

	const handleBack = () => {
		router.back();
	};

	const handleDownloadPDF = async () => {
		try {
			const response = await fetch(
				`${
					process.env.NEXT_PUBLIC_CASES_API_URL || "http://localhost:3033"
				}/api/v1/cases/${caseId}/pdf`,
				{
					credentials: "include",
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

	const handleFileUpload = async () => {
		if (patwariFiles.length === 0 && tiFiles.length === 0) {
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
					uploadedFor: caseId,
					description: `Patwari document for case ${caseId}`,
					tags: ["patwari", "case-document"],
				});
				patwariUrls.push(uploadResult.fileUrl);
			}

			// Upload TI files
			for (const file of tiFiles) {
				const uploadResult = await uploadFileMutation.mutateAsync({
					file,
					entityType: "other",
					uploadedFor: caseId,
					description: `TI document for case ${caseId}`,
					tags: ["ti", "case-document"],
				});
				tiUrls.push(uploadResult.fileUrl);
			}

			// Upload documents to case
			await uploadDocumentsMutation.mutateAsync({
				id: caseId,
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

	const handleApprove = async () => {
		if (!remark.trim()) {
			alert("Please enter a remark");
			return;
		}

		try {
			await updateCaseMutation.mutateAsync({
				id: caseId,
				data: { status: "approved", remark },
			});
			alert("Case approved successfully!");
			setShowApproveModal(false);
			setRemark("");
		} catch (error) {
			console.error("Failed to approve case:", error);
			alert("Failed to approve case");
		}
	};

	const handleReject = async () => {
		if (!remark.trim()) {
			alert("Please enter a remark");
			return;
		}

		try {
			await updateCaseMutation.mutateAsync({
				id: caseId,
				data: { status: "rejected", remark },
			});
			alert("Case rejected successfully!");
			setShowRejectModal(false);
			setRemark("");
		} catch (error) {
			console.error("Failed to reject case:", error);
			alert("Failed to reject case");
		}
	};

	const handleClose = async () => {
		if (!paymentRemark.trim()) {
			alert("Please enter a payment remark");
			return;
		}

		try {
			await closeCaseMutation.mutateAsync({
				id: caseId,
				data: { paymentRemark },
			});
			alert("Case closed successfully!");
			setShowCloseModal(false);
			setPaymentRemark("");
		} catch (error) {
			console.error("Failed to close case:", error);
			alert("Failed to close case");
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "created":
				return "bg-blue-100 text-blue-800";
			case "pendingSDM":
				return "bg-yellow-100 text-yellow-800";
			case "pendingRahatShakha":
				return "bg-orange-100 text-orange-800";
			case "pendingOIC":
				return "bg-purple-100 text-purple-800";
			case "pendingAdditionalCollector":
				return "bg-indigo-100 text-indigo-800";
			case "pendingCollector":
				return "bg-pink-100 text-pink-800";
			case "pendingAdditionalCollector2":
				return "bg-teal-100 text-teal-800";
			case "pendingTehsildar":
				return "bg-emerald-100 text-emerald-800";
			case "approved":
				return "bg-green-100 text-green-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			case "closed":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStageName = (stage: number) => {
		const stages = [
			"Created Waiting for Documents",
			"SDM Review Pending",
			"Rahat Shakha Review Pending",
			"OIC Review Pending",
			"Additional Collector Review Pending",
			"Collector Review Pending",
			"Additional Collector Job Pending",
			"Tehsildar distributes funds and closes case",
		];
		return stages[stage - 1] || `Stage ${stage}`;
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
				<Header />
				<div className="container mx-auto px-4 py-8">
					<div className="flex items-center justify-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
						<span className="ml-3 text-lg">Loading case details...</span>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	// Debug log to see the case data structure
	console.log("Case Data:", caseData);

	if (error || !caseData) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
				<Header />
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-red-600 mb-4">
							Case Not Found
						</h1>
						<p className="text-gray-600 mb-4">
							The case you&apos;re looking for doesn&apos;t exist or you
							don&apos;t have permission to view it.
						</p>
						<Button
							onClick={handleBack}
							className="bg-emerald-600 hover:bg-emerald-700">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Go Back
						</Button>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	return (
		caseData && (
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
										<Button
											onClick={handleBack}
											variant="ghost"
											className="text-white hover:bg-white/20 mb-4">
											<ArrowLeft className="h-4 w-4 mr-2" />
											Back
										</Button>
										<h1 className="text-3xl font-bold mb-2">Case Details</h1>
										<p className="text-emerald-100">
											Case ID: {caseData.caseId}
										</p>
									</div>
									<div className="flex space-x-2">
										<Button onClick={handleDownloadPDF}>
											<Download className="h-4 w-4 mr-2" />
											Download PDF
										</Button>
										{caseData.stage === 1 && caseData.status === "created" && (
											<Button
												onClick={() => setShowUploadModal(true)}
												variant="outline"
												className="text-white border-white hover:bg-white hover:text-slate-800">
												<Upload className="h-4 w-4 mr-2" />
												Upload Documents
											</Button>
										)}
									</div>
								</div>
							</div>

							{/* Case Status */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<Card className="bg-white shadow-lg">
									<CardContent className="p-4 text-center">
										<div className="flex items-center justify-center mb-2">
											<Clock className="h-8 w-8 text-blue-600" />
										</div>
										<h3 className="text-lg font-bold text-blue-800">Status</h3>
										<span
											className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
												caseData.status
											)}`}>
											{caseData.status}
										</span>
									</CardContent>
								</Card>

								<Card className="bg-white shadow-lg">
									<CardContent className="p-4 text-center">
										<div className="flex items-center justify-center mb-2">
											<FileText className="h-8 w-8 text-purple-600" />
										</div>
										<h3 className="text-lg font-bold text-purple-800">Stage</h3>
										<span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
											{getStageName(caseData.stage)}
										</span>
									</CardContent>
								</Card>

								<Card className="bg-white shadow-lg">
									<CardContent className="p-4 text-center">
										<div className="flex items-center justify-center mb-2">
											<Calendar className="h-8 w-8 text-green-600" />
										</div>
										<h3 className="text-lg font-bold text-green-800">
											Case ID
										</h3>
										<p className="text-sm text-gray-600 font-mono">
											{caseData.caseId}
										</p>
									</CardContent>
								</Card>
							</div>

							{/* Victim Information */}
							<Card className="bg-white shadow-lg">
								<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
									<CardTitle className="flex items-center">
										<User className="h-5 w-5 mr-2" />
										Victim Information
									</CardTitle>
								</CardHeader>
								<CardContent className="p-6">
									{caseData.victim ? (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<label className="text-sm font-medium text-gray-600">
													Name
												</label>
												<p className="text-lg font-semibold">
													{caseData.victim.name || "N/A"}
												</p>
											</div>
											<div>
												<label className="text-sm font-medium text-gray-600">
													Contact
												</label>
												<p className="text-lg font-semibold flex items-center">
													<Phone className="h-4 w-4 mr-2 text-gray-500" />
													{caseData.victim.contact || "N/A"}
												</p>
											</div>
											<div>
												<label className="text-sm font-medium text-gray-600">
													Date of Birth
												</label>
												<p className="text-lg font-semibold">
													{caseData.victim.dob
														? new Date(caseData.victim.dob).toLocaleDateString()
														: "N/A"}
												</p>
											</div>
											<div>
												<label className="text-sm font-medium text-gray-600">
													Date of Death
												</label>
												<p className="text-lg font-semibold">
													{caseData.victim.dod
														? new Date(caseData.victim.dod).toLocaleDateString()
														: "N/A"}
												</p>
											</div>
											<div className="md:col-span-2">
												<label className="text-sm font-medium text-gray-600">
													Address
												</label>
												<p className="text-lg font-semibold flex items-start">
													<MapPin className="h-4 w-4 mr-2 mt-1 text-gray-500 flex-shrink-0" />
													{caseData.victim.address || "N/A"}
												</p>
											</div>
											<div className="md:col-span-2">
												<label className="text-sm font-medium text-gray-600">
													Description
												</label>
												<p className="text-lg font-semibold flex items-start">
													<MessageSquare className="h-4 w-4 mr-2 mt-1 text-gray-500 flex-shrink-0" />
													{caseData.victim.description || "N/A"}
												</p>
											</div>
										</div>
									) : (
										<div className="text-center py-8">
											<p className="text-gray-500">
												No victim information available
											</p>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Documents */}
							<Card className="bg-white shadow-lg">
								<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
									<CardTitle>Documents</CardTitle>
								</CardHeader>
								<CardContent className="p-6">
									{caseData.documents && caseData.documents.length > 0 ? (
										<div className="space-y-4">
											{caseData.documents.map(
												(
													doc: {
														url: string;
														type: string;
														uploadedAt: string;
														name?: string;
													},
													index: number
												) => (
													<div
														key={index}
														className="flex items-center justify-between p-3 bg-gray-50 rounded">
														<div className="flex items-center">
															<FileText className="h-5 w-5 text-gray-500 mr-3" />
															<span className="font-medium">
																{doc.name || `Document ${index + 1}`}
															</span>
														</div>
														<Button variant="outline" size="sm">
															<Download className="h-4 w-4 mr-2" />
															Download
														</Button>
													</div>
												)
											)}
										</div>
									) : (
										<p className="text-gray-500 text-center py-4">
											No documents uploaded yet.
										</p>
									)}
								</CardContent>
							</Card>

							{/* Remarks */}
							<Card className="bg-white shadow-lg">
								<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
									<CardTitle>Remarks</CardTitle>
								</CardHeader>
								<CardContent className="p-6">
									{caseData.remarks && caseData.remarks.length > 0 ? (
										<div className="space-y-4">
											{caseData.remarks.map(
												(
													remark: {
														userId: string;
														date: string;
														remark: string;
													},
													index: number
												) => (
													<div key={index} className="p-3 bg-gray-50 rounded">
														<div className="flex items-center justify-between mb-2">
															<span className="font-medium">
																{remark.userId || "System"}
															</span>
															<span className="text-sm text-gray-500">
																{new Date(remark.date).toLocaleString()}
															</span>
														</div>
														<p className="text-gray-700">{remark.remark}</p>
													</div>
												)
											)}
										</div>
									) : (
										<p className="text-gray-500 text-center py-4">
											No remarks yet.
										</p>
									)}
								</CardContent>
							</Card>

							{/* Action Buttons - Based on workflow stages */}
							{caseData.stage >= 2 &&
								caseData.stage <= 7 &&
								caseData.status !== "closed" && (
									<Card className="bg-white shadow-lg">
										<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
											<CardTitle>Actions</CardTitle>
										</CardHeader>
										<CardContent className="p-6">
											<div className="flex space-x-4">
												<Button
													onClick={() => setShowApproveModal(true)}
													className="bg-green-600 hover:bg-green-700">
													<Check className="h-4 w-4 mr-2" />
													Approve Case
												</Button>
												{/* Only show reject button for stages 2-6 (not OBEY orders 7-8) */}
												{caseData.stage >= 2 && caseData.stage <= 6 && (
													<Button
														onClick={() => setShowRejectModal(true)}
														variant="outline"
														className="text-red-600 border-red-600 hover:bg-red-50">
														<X className="h-4 w-4 mr-2" />
														Reject Case
													</Button>
												)}
											</div>
										</CardContent>
									</Card>
								)}

							{/* Close Case - Only at Stage 8 (Tehsildar distributes funds and closes) */}
							{caseData.stage === 8 &&
								caseData.status === "pendingTehsildar" && (
									<Card className="bg-white shadow-lg">
										<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
											<CardTitle>Close Case</CardTitle>
										</CardHeader>
										<CardContent className="p-6">
											<Button
												onClick={() => setShowCloseModal(true)}
												className="bg-blue-600 hover:bg-blue-700">
												<FileText className="h-4 w-4 mr-2" />
												Close Case with Payment
											</Button>
										</CardContent>
									</Card>
								)}
						</div>
					</div>
				</div>

				<Footer />

				{/* Upload Documents Dialog */}
				<Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Upload Documents</DialogTitle>
							<DialogDescription>
								Upload Patwari and TI documents for this case.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<label className="text-sm font-medium">Patwari Documents</label>
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
									onChange={(e) => setTiFiles(Array.from(e.target.files || []))}
								/>
								{tiFiles.length > 0 && (
									<p className="text-sm text-gray-600 mt-1">
										{tiFiles.length} file(s) selected
									</p>
								)}
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={handleFileUpload}
								disabled={uploadingFiles}
								className="bg-green-600 hover:bg-green-700">
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
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Approve Dialog */}
				<Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Approve Case</DialogTitle>
							<DialogDescription>
								Approve this case and add a remark.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<label className="text-sm font-medium">Remark</label>
								<textarea
									className="w-full p-2 border rounded mt-1"
									rows={3}
									placeholder="Enter approval remark"
									value={remark}
									onChange={(e) => setRemark(e.target.value)}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={handleApprove}
								className="bg-green-600 hover:bg-green-700">
								Approve
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									setShowApproveModal(false);
									setRemark("");
								}}>
								Cancel
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Reject Dialog */}
				<Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Reject Case</DialogTitle>
							<DialogDescription>
								Reject this case and add a remark.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<label className="text-sm font-medium">Remark</label>
								<textarea
									className="w-full p-2 border rounded mt-1"
									rows={3}
									placeholder="Enter rejection remark"
									value={remark}
									onChange={(e) => setRemark(e.target.value)}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={handleReject}
								className="bg-red-600 hover:bg-red-700">
								Reject
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									setShowRejectModal(false);
									setRemark("");
								}}>
								Cancel
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Close Case Dialog */}
				<Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Close Case</DialogTitle>
							<DialogDescription>
								Close this case and add payment details.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<label className="text-sm font-medium">Payment Remark</label>
								<textarea
									className="w-full p-2 border rounded mt-1"
									rows={3}
									placeholder="Enter payment remark"
									value={paymentRemark}
									onChange={(e) => setPaymentRemark(e.target.value)}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={handleClose}
								className="bg-blue-600 hover:bg-blue-700">
								Close Case
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									setShowCloseModal(false);
									setPaymentRemark("");
								}}>
								Cancel
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		)
	);
}
