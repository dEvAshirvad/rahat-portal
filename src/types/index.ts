export interface User {
	id: string;
	email: string;
	name: string;
	role: "user" | "admin"; // Based on actual response
	emailVerified: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Session {
	expiresAt: string;
	token: string;
	createdAt: string;
	updatedAt: string;
	ipAddress: string;
	userAgent: string;
	userId: string;
	id: string;
}

export interface Member {
	_id: string;
	userId: string;
	departmentSlug: string;
	role: string;
	metadata: {
		kpirefs: any[];
		isMultipleKPIRef: boolean;
	};
	createdAt: string;
	updatedAt: string;
	user: User;
}

export interface Victim {
	name: string;
	dob: string;
	dod: string;
	address: string;
	contact: string;
	description: string;
	_id: string;
}

export interface Case {
	_id: string;
	caseId: string;
	victim: Victim;
	caseSDM: string;
	status: string;
	stage: number;
	documents: any[];
	remarks: any[];
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export interface PendingCasesResponse {
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
}

export interface CaseCreateRequest {
	name: string;
	dob: string;
	dod: string;
	address: string;
	contact: string;
	description: string;
	caseSDM: string;
}

export interface CaseUpdateRequest {
	status?: "approved" | "rejected";
	remark?: string;
	paymentRemark?: string;
}

export interface DocumentUploadRequest {
	patwari: string[]; // Array of fileUrl strings
	ti: string[]; // Array of fileUrl strings
}

export interface FileUploadResponse {
	id: string;
	originalName: string;
	filename: string;
	fileUrl: string;
	downloadUrl: string;
	mimetype: string;
	size: number;
	uploadedBy: string;
	uploadedFor: string;
	entityType: string;
	description?: string;
	tags: string[];
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
	canAccess: boolean;
	canDownload: boolean;
	compressionInfo: {
		compressedPaths: Record<string, any>;
		compressed: boolean;
		originalSize: number;
		compressionStatus: string;
		folderId: string;
	};
}

export interface StatusOverview {
	status: string;
	count: number;
	percentage: number;
}

export interface DelayAnalysis {
	totalDelayed: number;
	stageDelays: any[];
	criticalDelays: any[];
}

export interface RejectionAnalysis {
	totalRejections: number;
	rejectionsByStage: any[];
	topRejectionReasons: any[];
}

export interface Analytics {
	statusOverview: StatusOverview[];
	delayAnalysis: DelayAnalysis;
	rejectionAnalysis: RejectionAnalysis;
	totalCases: number;
	activeCases: number;
	closedCases: number;
	averageResolutionTime: number;
	lastUpdated: string;
}

export interface AuthResponse {
	redirect: boolean;
	token: string;
	user: User;
}

export interface LoginRequest {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface ApiResponse<T> {
	success?: boolean;
	data?: T;
	message?: string;
	error?: string;
	status?: number;
	timestamp?: string;
	cache?: boolean;
	// For auth responses
	redirect?: boolean;
	token?: string;
	user?: User;
	// For member responses
	member?: Member;
}
