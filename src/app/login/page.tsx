"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import { useLogin } from "@/queries";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showForgotPassword, setShowForgotPassword] = useState(false);
	const loginMutation = useLogin();
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const response = await loginMutation.mutateAsync({
				email: username,
				password: password,
				rememberMe: true,
			});

			// Get user from response
			const user = response.user;

			if (user) {
				// Route based on user role
				// For now, redirect all users to officer dashboard
				// In a real app, you would check the user's role from the backend
				if (user.role === "admin") {
					router.push("/dashboard/collector");
				} else {
					router.push("/dashboard/officer");
				}
			}
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	const loginError = loginMutation.error?.message || "";
	const isLoading = loginMutation.isPending;

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

					{/* Login Card */}
					<div className="lg:col-span-3">
						<div className="relative mb-8">
							<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-8 text-white relative overflow-hidden shadow-xl">
								<div className="absolute inset-0 bg-black/20" />
								<div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
									<div>
										<h2 className="text-4xl font-bold mb-4">
											Project <br />
											<span className="text-amber-300">Rahat</span>
										</h2>
										<p className="text-lg mb-2">
											RBC 6(4) Case Resolution Portal
										</p>
										<p className="text-sm">
											Financial assistance for unnatural deaths in Raipur,
											Chhattisgarh
										</p>
									</div>

									{/* Login Form */}
									<Card className="bg-white/95 backdrop-blur-sm shadow-2xl p-0 rounded-lg">
										<CardHeader className="bg-gradient-to-r from-slate-700 py-4 to-slate-800 text-white rounded-t-lg text-center">
											<CardTitle className="text-xl font-bold">
												Secure Login Portal
											</CardTitle>
											<p className="text-slate-200 text-sm">
												Government Officials & Citizens
											</p>
										</CardHeader>
										<CardContent className="p-6">
											<form onSubmit={handleLogin} className="space-y-4">
												<div>
													<Label
														htmlFor="username"
														className="text-sm font-medium text-slate-700">
														Username / Email ID
													</Label>
													<div className="relative">
														<User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
														<Input
															id="username"
															value={username}
															onChange={(e) => setUsername(e.target.value)}
															required
															placeholder="Enter your username"
															className="pl-10"
														/>
													</div>
												</div>

												<div>
													<Label
														htmlFor="password"
														className="text-sm font-medium text-slate-700">
														Password
													</Label>
													<div className="relative">
														<Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
														<Input
															id="password"
															type={showPassword ? "text" : "password"}
															value={password}
															onChange={(e) => setPassword(e.target.value)}
															required
															placeholder="Enter your password"
															className="pl-10 pr-10"
														/>
														<button
															type="button"
															onClick={() => setShowPassword(!showPassword)}
															className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
															{showPassword ? (
																<EyeOff className="h-4 w-4" />
															) : (
																<Eye className="h-4 w-4" />
															)}
														</button>
													</div>
												</div>

												{loginError && (
													<div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
														{loginError}
													</div>
												)}

												<Button
													type="submit"
													disabled={isLoading}
													className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-medium py-2.5">
													{isLoading ? "Authenticating..." : "Secure Login"}
												</Button>

												<div className="text-center space-y-2">
													<button
														type="button"
														onClick={() => setShowForgotPassword(true)}
														className="text-sm text-slate-600 hover:text-slate-800 font-medium">
														Forgot Password?
													</button>
													<div className="text-xs text-slate-500">
														For technical support: <strong>0771-2234567</strong>
													</div>
												</div>
											</form>
										</CardContent>
									</Card>
								</div>
							</div>
						</div>

						{/* Info Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-600">
								<CardContent className="p-4 text-center">
									<h3 className="font-bold text-blue-800 mb-2">₹1.5 Lakh</h3>
									<p className="text-sm text-blue-700">Financial Assistance</p>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-600">
								<CardContent className="p-4 text-center">
									<h3 className="font-bold text-green-800 mb-2">9 Stages</h3>
									<p className="text-sm text-green-700">
										Case Resolution Process
									</p>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-600">
								<CardContent className="p-4 text-center">
									<h3 className="font-bold text-amber-800 mb-2">24/7</h3>
									<p className="text-sm text-amber-700">Online Support</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>

			<Footer />

			{/* Forgot Password Modal */}
			<ForgotPasswordModal
				isOpen={showForgotPassword}
				onClose={() => setShowForgotPassword(false)}
			/>
		</div>
	);
}
