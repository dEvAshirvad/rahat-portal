"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

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

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Reset Password</DialogTitle>
					<DialogDescription>
						Enter your email address to receive a password reset link.
					</DialogDescription>
				</DialogHeader>
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
							We&apos;ll send you a link to reset your password.
						</p>
						<DialogFooter>
							<Button
								type="submit"
								className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900">
								Send Reset Link
							</Button>
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
						</DialogFooter>
					</form>
				) : (
					<div className="text-center space-y-4">
						<div className="text-green-600 text-4xl">✓</div>
						<h3 className="text-lg font-semibold">Email Sent!</h3>
						<p className="text-sm text-gray-600">
							If an account with that email exists, we&apos;ve sent a password
							reset link.
						</p>
						<DialogFooter>
							<Button onClick={onClose} className="w-full">
								Close
							</Button>
						</DialogFooter>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
