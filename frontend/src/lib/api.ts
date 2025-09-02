import axios from 'axios';
import { 
  User, 
  Project, 
  Comment, 
  LoginDto, 
  RegisterDto, 
  AuthResponse,
  CreateProjectDto,
  CreateCommentDto,
  CreateDepartmentTransitionDto,
  UpdateDepartmentWorkStatusDto,
  CreateCorrectionDto,
  UpdateCorrectionDto,
  ProjectDepartmentHistory,
  DepartmentCorrection,
  ProjectTimelineAnalytics
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: LoginDto): Promise<AuthResponse> =>
    api.post('/auth/login', data).then((res) => res.data),
  
  register: (data: RegisterDto): Promise<AuthResponse> =>
    api.post('/auth/register', data).then((res) => res.data),
};

// Users API
export const usersApi = {
  getAll: (): Promise<{ data: User[] }> =>
    api.get('/users').then((res) => ({ data: res.data })),
  
  getById: (id: string): Promise<User> =>
    api.get(`/users/${id}`).then((res) => res.data),
  
  create: (data: { name: string; email: string; password?: string; roleId: string; departmentId: string; avatar?: string }) =>
    api.post('/users', data).then((res) => res.data),
  
  update: (id: string, data: Partial<User>): Promise<User> =>
    api.patch(`/users/${id}`, data).then((res) => res.data),
  
  delete: (id: string, force: boolean = false): Promise<void> =>
    api.delete(`/users/${id}${force ? '?force=true' : ''}`).then((res) => res.data),

  getPMOCoordinators: (): Promise<User[]> =>
    api.get('/users/pmo/coordinators').then((res) => res.data),
};

// Departments API
export const departmentsApi = {
  getAll: () =>
    api.get('/departments').then((res) => res.data),
};

// Roles API
export const rolesApi = {
  getAll: () =>
    api.get('/roles').then((res) => res.data),
  
  getByDepartment: (departmentId: string) =>
    api.get(`/roles/by-department?departmentId=${departmentId}`).then((res) => res.data),
};

// Projects API
export const projectsApi = {
  getAll: (): Promise<Project[]> =>
    api.get('/projects').then((res) => res.data),
  
  getById: (id: string): Promise<Project> =>
    api.get(`/projects/${id}`).then((res) => res.data),
  
  create: (data: CreateProjectDto): Promise<Project> =>
    api.post('/projects', data).then((res) => res.data),
  
  update: (id: string, data: Partial<CreateProjectDto>): Promise<Project> =>
    api.patch(`/projects/${id}`, data).then((res) => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/projects/${id}`).then((res) => res.data),
  
  addCustomField: (id: string, fieldName: string, fieldValue: string) =>
    api.post(`/projects/${id}/custom-fields`, { fieldName, fieldValue }).then((res) => res.data),
  
  moveToDepartment: (id: string, data: CreateDepartmentTransitionDto): Promise<Project> =>
    api.post(`/projects/${id}/move-to-department`, data).then((res) => res.data),
  
  getDepartmentHistory: (id: string): Promise<ProjectDepartmentHistory[]> =>
    api.get(`/projects/${id}/department-history`).then((res) => res.data),
  
  updateDepartmentWorkStatus: (id: string, data: UpdateDepartmentWorkStatusDto): Promise<ProjectDepartmentHistory> =>
    api.patch(`/projects/${id}/department-status`, data).then((res) => res.data),
  
  createCorrection: (projectId: string, historyId: string, data: CreateCorrectionDto): Promise<DepartmentCorrection> =>
    api.post(`/projects/${projectId}/departments/${historyId}/corrections`, data).then((res) => res.data),
  
  getProjectCorrections: (id: string): Promise<DepartmentCorrection[]> =>
    api.get(`/projects/${id}/corrections`).then((res) => res.data),
  
  updateCorrection: (projectId: string, correctionId: string, data: UpdateCorrectionDto): Promise<DepartmentCorrection> =>
    api.patch(`/projects/${projectId}/corrections/${correctionId}`, data).then((res) => res.data),
  
  getTimelineAnalytics: (id: string): Promise<ProjectTimelineAnalytics> =>
    api.get(`/projects/${id}/timeline-analytics`).then((res) => res.data),

  // Enhanced Workflow Methods
  requestApproval: (projectId: string, historyId: string, approvalType: string) =>
    api.post(`/projects/${projectId}/departments/${historyId}/request-approval`, { approvalType }).then((res) => res.data),

  submitApproval: (projectId: string, approvalId: string, status: string, comments?: string, rejectionReason?: string) =>
    api.patch(`/projects/${projectId}/approvals/${approvalId}`, { status, comments, rejectionReason }).then((res) => res.data),

  startQATesting: (projectId: string, historyId: string, qaType: string, testedById: string) =>
    api.post(`/projects/${projectId}/departments/${historyId}/start-qa`, { qaType, testedById }).then((res) => res.data),

  completeQATesting: (projectId: string, qaRoundId: string, status: string, bugsFound: number, criticalBugs: number, testResults?: string, rejectionReason?: string) =>
    api.patch(`/projects/${projectId}/qa-rounds/${qaRoundId}/complete`, { status, bugsFound, criticalBugs, testResults, rejectionReason }).then((res) => res.data),

  createQABug: (projectId: string, qaRoundId: string, bugData: any) =>
    api.post(`/projects/${projectId}/qa-rounds/${qaRoundId}/bugs`, bugData).then((res) => res.data),

  getWorkflowStatus: (id: string) =>
    api.get(`/projects/${id}/workflow-status`).then((res) => res.data),

  getAllowedNextDepartments: (id: string) =>
    api.get(`/projects/${id}/allowed-departments`).then((res) => res.data),

  getWorkflowValidationStatus: (id: string) =>
    api.get(`/projects/${id}/workflow-validation`).then((res) => res.data),

  // PC Assignment Methods
  reassignPCOrTL: (projectId: string, data: { assignmentType: 'PROJECT_COORDINATOR' | 'PC_TEAM_LEAD'; newUserId: string; reason?: string; notes?: string }) =>
    api.patch(`/projects/${projectId}/reassign`, data).then((res) => res.data),

  getAssignmentHistory: (projectId: string) =>
    api.get(`/projects/${projectId}/assignment-history`).then((res) => res.data),
};


// Comments API
export const commentsApi = {
  getAll: (projectId?: string): Promise<Comment[]> => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    
    return api.get(`/comments?${params.toString()}`).then((res) => res.data);
  },
  
  getById: (id: string): Promise<Comment> =>
    api.get(`/comments/${id}`).then((res) => res.data),
  
  create: (data: CreateCommentDto): Promise<Comment> =>
    api.post('/comments', data).then((res) => res.data),
  
  update: (id: string, data: { content: string }): Promise<Comment> =>
    api.patch(`/comments/${id}`, data).then((res) => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/comments/${id}`).then((res) => res.data),
};