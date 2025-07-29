"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Eye, Check, X, Upload, FileText, Download, Plus } from "lucide-react";
import type { Case } from "@/types";

interface CaseTableProps {
	cases: Case[];
	userRole: string;
	onViewCase: (caseId: string) => void;
	onApproveCase: (caseId: string, remark: string) => void;
	onRejectCase: (caseId: string, remark: string) => void;
	onUploadDocuments: (caseId: string) => void;
	onCreateCase: () => void;
	onDownloadPDF: (caseId: string) => void;
	onCloseCase: (caseId: string, paymentRemark: string) => void;
}

export default function CaseTable({
	cases,
	userRole,
	onViewCase,
	onApproveCase,
	onRejectCase,
	onUploadDocuments,
	onCreateCase,
	onDownloadPDF,
	onCloseCase,
}: CaseTableProps) {
	const [selectedCase, setSelectedCase] = useState<Case | null>(null);
	const [showApproveModal, setShowApproveModal] = useState(false);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [showCloseModal, setShowCloseModal] = useState(false);
	const [remark, setRemark] = useState("");
	const [paymentRemark, setPaymentRemark] = useState("");

	const canPerformAction = (caseItem: Case, action: string) => {
		switch (action) {
			case "approve":
				return (
					[
						"sdm",
						"rahat-shakha",
						"oic",
						"additional-collector",
						"collector",
					].includes(userRole) &&
					caseItem.stage >= 2 &&
					caseItem.stage <= 7 &&
					caseItem.status !== "closed"
				);
			case "reject":
				return (
					[
						"sdm",
						"rahat-shakha",
						"oic",
						"additional-collector",
						"collector",
					].includes(userRole) &&
					caseItem.stage >= 2 &&
					caseItem.stage <= 6 &&
					caseItem.status !== "closed"
				);
			case "upload":
				return (
					userRole === "tehsildar" &&
					caseItem.stage === 1 &&
					caseItem.status === "created"
				);
			case "create":
				return userRole === "tehsildar";
			case "close":
				return (
					userRole === "tehsildar" &&
					caseItem.stage === 8 &&
					caseItem.status === "pendingTehsildar"
				);
			case "download":
				return true;
			default:
				return false;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "created":
				return "bg-blue-100 text-blue-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
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

	const handleApprove = () => {
		if (selectedCase && remark.trim()) {
			onApproveCase(selectedCase.caseId, remark);
			setShowApproveModal(false);
			setRemark("");
			setSelectedCase(null);
		}
	};

	const handleReject = () => {
		if (selectedCase && remark.trim()) {
			onRejectCase(selectedCase.caseId, remark);
			setShowRejectModal(false);
			setRemark("");
			setSelectedCase(null);
		}
	};

	const handleClose = () => {
		if (selectedCase && paymentRemark.trim()) {
			onCloseCase(selectedCase.caseId, paymentRemark);
			setShowCloseModal(false);
			setPaymentRemark("");
			setSelectedCase(null);
		}
	};

	return (
		<Card className="bg-white shadow-lg">
			<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Cases</CardTitle>
					{canPerformAction(cases[0] || {}, "create") && (
						<Button
							onClick={onCreateCase}
							className="bg-green-600 hover:bg-green-700">
							<Plus className="h-4 w-4 mr-2" />
							Create Case
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Case ID</TableHead>
							<TableHead>Victim Name</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Stage</TableHead>
							<TableHead>Created Date</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{cases.map((caseItem) => (
							<TableRow key={caseItem._id || caseItem.caseId}>
								<TableCell className="font-medium">{caseItem.caseId}</TableCell>
								<TableCell>{caseItem.victim?.name || "N/A"}</TableCell>
								<TableCell>
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
											caseItem.status
										)}`}>
										{caseItem.status}
									</span>
								</TableCell>
								<TableCell>
									<span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
										{getStageName(caseItem.stage)}
									</span>
								</TableCell>
								<TableCell>
									{new Date(caseItem.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<div className="flex space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onViewCase(caseItem.caseId)}>
											<Eye className="h-4 w-4" />
										</Button>

										{canPerformAction(caseItem, "download") && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => onDownloadPDF(caseItem.caseId)}>
												<Download className="h-4 w-4" />
											</Button>
										)}

										{canPerformAction(caseItem, "upload") && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => onUploadDocuments(caseItem.caseId)}
												title="Upload Documents"
												className="text-blue-600 hover:text-blue-700">
												<Upload className="h-4 w-4 mr-1" />
												Upload
											</Button>
										)}

										{canPerformAction(caseItem, "approve") && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setSelectedCase(caseItem);
													setShowApproveModal(true);
												}}
												className="text-green-600 hover:text-green-700">
												<Check className="h-4 w-4" />
											</Button>
										)}

										{canPerformAction(caseItem, "reject") && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setSelectedCase(caseItem);
													setShowRejectModal(true);
												}}
												className="text-red-600 hover:text-red-700">
												<X className="h-4 w-4" />
											</Button>
										)}

										{canPerformAction(caseItem, "close") && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setSelectedCase(caseItem);
													setShowCloseModal(true);
												}}
												className="text-blue-600 hover:text-blue-700">
												<FileText className="h-4 w-4" />
											</Button>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>

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
								setSelectedCase(null);
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
								setSelectedCase(null);
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
								setSelectedCase(null);
							}}>
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
