"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface ForgotPasswordModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function ForgotPasswordModal({
	isOpen,
	onClose,
}: ForgotPasswordModalProps) {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		// Mock submission - in real app, call API
		setIsSubmitted(true);
		setTimeout(() => {
			setIsSubmitted(false);
			onClose();
		}, 2000);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<Card className="w-full max-w-md mx-4">
				<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
					<div className="flex items-center justify-between">
						<CardTitle className="text-xl">Reset Password</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							className="text-white hover:text-gray-300">
							<X className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className="p-6">
					{!isSubmitted ? (
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<Label htmlFor="email" className="text-sm font-medium">
									Email Address
								</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									placeholder="Enter your email address"
								/>
							</div>
							<p className="text-sm text-gray-600">
								We'll send you a link to reset your password.
							</p>
							<div className="flex space-x-2">
								<Button
									type="submit"
									className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900">
									Send Reset Link
								</Button>
								<Button type="button" variant="outline" onClick={onClose}>
									Cancel
								</Button>
							</div>
						</form>
					) : (
						<div className="text-center space-y-4">
							<div className="text-green-600 text-4xl">✓</div>
							<h3 className="text-lg font-semibold">Email Sent!</h3>
							<p className="text-sm text-gray-600">
								If an account with that email exists, we've sent a password
								reset link.
							</p>
							<Button onClick={onClose} className="w-full">
								Close
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
