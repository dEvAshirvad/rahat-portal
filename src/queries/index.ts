import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { authService, casesApi, analyticsApi, fileService } from "@/lib/api";
import type { CaseUpdateRequest, DocumentUploadRequest } from "@/types";

// Auth Queries
export const useLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: authService.login,
		onSuccess: (data) => {
			// Clear all queries when logging in to ensure fresh data
			queryClient.clear();
			// Store user data in query cache
			queryClient.setQueryData(["user"], data.user);
		},
	});
};

export const useCurrentUser = () => {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ["user"],
		queryFn: authService.getCurrentUser,
		// Always try to get user session
		enabled: true,
	});

	// Invalidate case queries when user changes
	React.useEffect(() => {
		if (query.data) {
			queryClient.invalidateQueries({ queryKey: ["my-pending-cases"] });
			queryClient.invalidateQueries({ queryKey: ["cases"] });
			queryClient.invalidateQueries({ queryKey: ["analytics"] });
		}
	}, [query.data?.id, queryClient]);

	return query;
};

export const useMemberInfo = () => {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ["member"],
		queryFn: authService.getMemberInfo,
		enabled: true,
	});

	// Invalidate case queries when member info changes (role change)
	React.useEffect(() => {
		if (query.data) {
			// Clear all case-related queries when role changes
			queryClient.invalidateQueries({ queryKey: ["my-pending-cases"] });
			queryClient.invalidateQueries({ queryKey: ["cases"] });
			queryClient.invalidateQueries({ queryKey: ["analytics"] });
			queryClient.invalidateQueries({ queryKey: ["case"] });
		}
	}, [query.data?.role, queryClient]);

	return query;
};

export const useMembersByRole = (role: string) => {
	return useQuery({
		queryKey: ["members", role],
		queryFn: () => authService.getMembersByRole(role),
		enabled: !!role,
	});
};

export const useLogout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: authService.logout,
		onSuccess: () => {
			// Clear ALL queries from cache when logging out
			queryClient.clear();
		},
	});
};

// Cases Queries
export const useCases = (params?: {
	page?: number;
	limit?: number;
	search?: string;
}) => {
	return useQuery({
		queryKey: ["cases", params],
		queryFn: () => casesApi.getCases(params),
	});
};

export const useMyPendingCases = (params?: {
	page?: number;
	limit?: number;
	search?: string;
}) => {
	const { data: member } = useMemberInfo();

	return useQuery({
		queryKey: ["my-pending-cases", member?.role, params],
		queryFn: () => casesApi.getMyPendingCases(params),
		enabled: !!member?.role,
	});
};

export const useCase = (id: string) => {
	return useQuery({
		queryKey: ["case", id],
		queryFn: () => casesApi.getCase(id),
		enabled: !!id,
	});
};

export const useCreateCase = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: casesApi.createCase,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cases"] });
			queryClient.invalidateQueries({ queryKey: ["my-pending-cases"] });
		},
	});
};

export const useUpdateCase = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: CaseUpdateRequest }) =>
			casesApi.updateCase(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["cases"] });
			queryClient.invalidateQueries({ queryKey: ["my-pending-cases"] });
			queryClient.invalidateQueries({ queryKey: ["case", id] });
		},
	});
};

export const useCloseCase = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: { paymentRemark: string };
		}) => casesApi.closeCase(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["cases"] });
			queryClient.invalidateQueries({ queryKey: ["my-pending-cases"] });
			queryClient.invalidateQueries({ queryKey: ["case", id] });
		},
	});
};

export const useUploadDocuments = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: DocumentUploadRequest }) =>
			casesApi.uploadDocuments(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["case", id] });
			queryClient.invalidateQueries({ queryKey: ["my-pending-cases"] });
		},
	});
};

// Analytics Queries
export const useDashboardAnalytics = () => {
	return useQuery({
		queryKey: ["analytics", "dashboard"],
		queryFn: analyticsApi.getDashboardAnalytics,
	});
};

// File Upload Queries
export const useUploadFile = () => {
	return useMutation({
		mutationFn: ({
			file,
			entityType,
			uploadedFor,
			description,
			tags,
		}: {
			file: File;
			entityType: string;
			uploadedFor: string;
			description?: string;
			tags?: string[];
		}) =>
			fileService.uploadFile(file, entityType, uploadedFor, description, tags),
	});
};
