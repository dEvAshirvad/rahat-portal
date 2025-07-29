import axios from "axios";
import type {
	Case,
	CaseCreateRequest,
	CaseUpdateRequest,
	DocumentUploadRequest,
	Analytics,
	AuthResponse,
	LoginRequest,
	User,
	Member,
	ApiResponse,
} from "@/types";

// Create axios instance for auth service
const authApi = axios.create({
	baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3001",
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true, // Enable cookies for session management
});

// Create axios instance for case service
const caseApi = axios.create({
	baseURL: process.env.NEXT_PUBLIC_CASES_API_URL || "http://localhost:3033",
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true, // Enable cookies for session management
});

// Create axios instance for file service
const fileApi = axios.create({
	baseURL: process.env.NEXT_PUBLIC_FILES_API_URL || "http://localhost:3034",
	withCredentials: true, // Enable cookies for session management
});

// Response interceptor for error handling
caseApi.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Redirect to login on unauthorized
			window.location.href = "/login";
		}
		return Promise.reject(error);
	}
);

// Auth API
export const authService = {
	login: async (data: LoginRequest): Promise<AuthResponse> => {
		const response = await authApi.post<ApiResponse<AuthResponse>>(
			"/api/auth/sign-in/email",
			data
		);
		return response.data as AuthResponse;
	},

	getCurrentUser: async (): Promise<User> => {
		const response = await authApi.get<ApiResponse<{ user: User }>>(
			"/api/auth/get-session"
		);
		return response.data.user!;
	},

	getMemberInfo: async (): Promise<Member> => {
		const response = await authApi.get<ApiResponse<{ member: Member }>>(
			"/api/v1/members/me"
		);
		return response.data.member!;
	},

	getMembersByRole: async (
		role: string
	): Promise<{
		docs: Array<{
			_id: string;
			userId: string;
			departmentSlug: string;
			role: string;
			user: {
				_id: string;
				name: string;
				email: string;
			};
		}>;
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		message: string;
	}> => {
		const response = await authApi.get<
			ApiResponse<{
				docs: Array<{
					_id: string;
					userId: string;
					departmentSlug: string;
					role: string;
					user: {
						_id: string;
						name: string;
						email: string;
					};
				}>;
				total: number;
				page: number;
				limit: number;
				totalPages: number;
				message: string;
			}>
		>(`/api/v1/members?role=${role}`);
		return response.data as {
			docs: Array<{
				_id: string;
				userId: string;
				departmentSlug: string;
				role: string;
				user: {
					_id: string;
					name: string;
					email: string;
				};
			}>;
			total: number;
			page: number;
			limit: number;
			totalPages: number;
			message: string;
		};
	},

	logout: async (): Promise<void> => {
		await authApi.post("/api/auth/sign-out");
	},
};

// File Upload API
export const fileService = {
	uploadFile: async (
		file: File,
		entityType: string,
		uploadedFor: string,
		description?: string,
		tags?: string[]
	): Promise<{
		id: string;
		originalName: string;
		filename: string;
		fileUrl: string;
		downloadUrl: string;
	}> => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("uploadedFor", uploadedFor);
		formData.append("entityType", entityType);
		if (description) formData.append("description", description);
		if (tags) formData.append("tags", tags.join(","));
		formData.append("isPublic", "false");

		const response = await fileApi.post<
			ApiResponse<{
				id: string;
				originalName: string;
				filename: string;
				fileUrl: string;
				downloadUrl: string;
			}>
		>("/api/v1/files/upload", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data.data!;
	},
};

// Cases API
export const casesApi = {
	createCase: async (data: CaseCreateRequest): Promise<{ caseId: string }> => {
		const response = await caseApi.post<ApiResponse<{ caseId: string }>>(
			"/api/v1/cases/create",
			data
		);
		return response.data as { caseId: string };
	},

	getCases: async (params?: {
		page?: number;
		limit?: number;
		search?: string;
	}): Promise<{
		docs: Case[];
		total: number;
		page: number;
		totalPages: number;
		message: string;
	}> => {
		const response = await caseApi.get("/api/v1/cases", { params });
		// The API returns the case data directly, not wrapped in a data property
		return response.data as {
			docs: Case[];
			total: number;
			page: number;
			totalPages: number;
			message: string;
		};
	},

	getMyPendingCases: async (params?: {
		page?: number;
		limit?: number;
		search?: string;
	}): Promise<{
		docs: Case[];
		limit: number;
		totalDocs: number;
		totalPages: number;
		page: number;
		nextPage: boolean;
		prevPage: boolean;
		userRole: string;
		stageFilter: number | null;
		message: string;
		success: boolean;
		status: number;
		timestamp: string;
		cache: boolean;
	}> => {
		const response = await caseApi.get("/api/v1/cases/my-pending", { params });
		// The API returns the case data directly, not wrapped in a data property
		return response.data as {
			docs: Case[];
			limit: number;
			totalDocs: number;
			totalPages: number;
			page: number;
			nextPage: boolean;
			prevPage: boolean;
			userRole: string;
			stageFilter: number | null;
			message: string;
			success: boolean;
			status: number;
			timestamp: string;
			cache: boolean;
		};
	},

	getCase: async (
		id: string
	): Promise<{
		caseId: string;
		victim: {
			name: string;
			dob: string;
			dod: string;
			address: string;
			contact: string;
			description: string;
			_id: string;
		};
		status: string;
		stage: number;
		documents: Array<{
			url: string;
			type: string;
			uploadedAt: string;
			_id: string;
		}>;
		remarks: Array<{
			stage: number;
			remark: string;
			userId: string;
			date: string;
			_id: string;
		}>;
		message: string;
	}> => {
		const response = await caseApi.get(`/api/v1/cases/${id}`);
		// The API returns the case data directly, not wrapped in a data property
		return response.data as {
			caseId: string;
			victim: {
				name: string;
				dob: string;
				dod: string;
				address: string;
				contact: string;
				description: string;
				_id: string;
			};
			status: string;
			stage: number;
			documents: Array<{
				url: string;
				type: string;
				uploadedAt: string;
				_id: string;
			}>;
			remarks: Array<{
				stage: number;
				remark: string;
				userId: string;
				date: string;
				_id: string;
			}>;
			message: string;
		};
	},

	updateCase: async (
		id: string,
		data: CaseUpdateRequest
	): Promise<{
		message: string;
		caseId: string;
		newStatus: string;
		newStage: number;
		remark: string;
	}> => {
		const response = await caseApi.put<
			ApiResponse<{
				message: string;
				caseId: string;
				newStatus: string;
				newStage: number;
				remark: string;
			}>
		>(`/api/v1/cases/${id}/update`, data);
		return response.data as {
			message: string;
			caseId: string;
			newStatus: string;
			newStage: number;
			remark: string;
		};
	},

	closeCase: async (
		id: string,
		data: { paymentRemark: string }
	): Promise<{
		message: string;
		caseId: string;
		status: string;
		stage: number;
		payment: {
			status: string;
			amount: number;
			remark: string;
			date: string;
			processedBy: string;
		};
		finalPDFUrl: string;
	}> => {
		const response = await caseApi.put<
			ApiResponse<{
				message: string;
				caseId: string;
				status: string;
				stage: number;
				payment: {
					status: string;
					amount: number;
					remark: string;
					date: string;
					processedBy: string;
				};
				finalPDFUrl: string;
			}>
		>(`/api/v1/cases/${id}/close`, data);
		return response.data as unknown as {
			message: string;
			caseId: string;
			status: string;
			stage: number;
			payment: {
				status: string;
				amount: number;
				remark: string;
				date: string;
				processedBy: string;
			};
			finalPDFUrl: string;
		};
	},

	uploadDocuments: async (
		id: string,
		data: DocumentUploadRequest
	): Promise<{
		message: string;
		caseId: string;
		documents: {
			patwari: number;
			ti: number;
			total: number;
		};
		newStatus: string;
		newStage: number;
	}> => {
		const response = await caseApi.post<
			ApiResponse<{
				message: string;
				caseId: string;
				documents: {
					patwari: number;
					ti: number;
					total: number;
				};
				newStatus: string;
				newStage: number;
			}>
		>(`/api/v1/cases/${id}/documents/upload`, data);
		return response.data as {
			message: string;
			caseId: string;
			documents: {
				patwari: number;
				ti: number;
				total: number;
			};
			newStatus: string;
			newStage: number;
		};
	},

	getCasePDF: async (id: string): Promise<Blob> => {
		const response = await caseApi.get(`/api/v1/cases/${id}/pdf`, {
			responseType: "blob",
		});
		return response.data;
	},

	getCaseFinalPDF: async (id: string): Promise<Blob> => {
		const response = await caseApi.get(`/api/v1/cases/${id}/final-pdf`, {
			responseType: "blob",
		});
		return response.data;
	},
};

// Analytics API
export const analyticsApi = {
	getDashboardAnalytics: async (): Promise<Analytics> => {
		const response = await caseApi.get<ApiResponse<Analytics>>(
			"/api/v1/analytics/dashboard"
		);
		return response.data.data!;
	},
};

export default caseApi;
