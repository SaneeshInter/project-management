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
  DepartmentChecklistProgress,
  ProjectChecklistItem,
  UpdateChecklistItemDto,
  CreateChecklistItemLinkDto,
  CreateChecklistItemUpdateDto,
  CategoryMaster,
  CreateCategoryMasterDto,
  UpdateCategoryMasterDto,
  CategoryDepartmentMapping,
  CreateCategoryDepartmentMappingDto,
  UpdateCategoryDepartmentMappingDto,
  CategoryWorkflowDto
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
  
  getMainDepartments: () =>
    api.get('/departments/main').then((res) => res.data),
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


  // Department Checklist Methods
  getChecklistProgress: (projectId: string, department?: string): Promise<DepartmentChecklistProgress> =>
    api.get(`/projects/${projectId}/checklist${department ? `?department=${department}` : ''}`).then((res) => res.data),

  updateChecklistItem: (projectId: string, itemId: string, data: UpdateChecklistItemDto): Promise<ProjectChecklistItem> =>
    api.patch(`/projects/${projectId}/checklist/${itemId}`, data).then((res) => res.data),

  addChecklistItemLink: (projectId: string, itemId: string, data: CreateChecklistItemLinkDto): Promise<any> =>
    api.post(`/projects/${projectId}/checklist/${itemId}/links`, data).then((res) => res.data),

  removeChecklistItemLink: (projectId: string, itemId: string, linkId: string): Promise<void> =>
    api.delete(`/projects/${projectId}/checklist/${itemId}/links/${linkId}`).then((res) => res.data),

  addChecklistItemUpdate: (projectId: string, itemId: string, data: CreateChecklistItemUpdateDto): Promise<any> =>
    api.post(`/projects/${projectId}/checklist/${itemId}/updates`, data).then((res) => res.data),

  getChecklistTemplates: (department: string): Promise<any[]> =>
    api.get(`/checklist/templates/${department}`).then((res) => res.data),
};

// Checklist Templates API
export const checklistTemplatesApi = {
  getByDepartment: (department: string) =>
    api.get(`/checklist/templates/${department}`).then((res) => res.data),

  create: (data: {
    department: string;
    title: string;
    description?: string;
    isRequired: boolean;
    order: number;
  }) =>
    api.post('/checklist/templates', data).then((res) => res.data),

  update: (id: string, data: {
    title: string;
    description?: string;
    isRequired: boolean;
    order: number;
  }) =>
    api.patch(`/checklist/templates/${id}`, data).then((res) => res.data),

  delete: (id: string) =>
    api.delete(`/checklist/templates/${id}`).then((res) => res.data),

  reorder: (department: string, itemIds: string[]) =>
    api.patch(`/checklist/templates/${department}/reorder`, { itemIds }).then((res) => res.data),
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

// Categories API
export const categoriesApi = {
  // Category Master operations
  getAll: (includeInactive = false): Promise<CategoryMaster[]> => {
    const params = includeInactive ? '?includeInactive=true' : '';
    return api.get(`/categories${params}`).then((res) => res.data);
  },
  
  getById: (id: string): Promise<CategoryMaster> =>
    api.get(`/categories/${id}`).then((res) => res.data),
  
  create: (data: CreateCategoryMasterDto): Promise<CategoryMaster> =>
    api.post('/categories', data).then((res) => res.data),
  
  update: (id: string, data: UpdateCategoryMasterDto): Promise<CategoryMaster> =>
    api.patch(`/categories/${id}`, data).then((res) => res.data),
  
  delete: (id: string): Promise<{ message: string }> =>
    api.delete(`/categories/${id}`).then((res) => res.data),
  
  // Department mapping operations
  getDepartmentMappings: (categoryId: string): Promise<CategoryDepartmentMapping[]> =>
    api.get(`/categories/${categoryId}/departments`).then((res) => res.data),
  
  createDepartmentMapping: (categoryId: string, data: Omit<CreateCategoryDepartmentMappingDto, 'categoryId'>): Promise<CategoryDepartmentMapping> =>
    api.post(`/categories/${categoryId}/departments`, data).then((res) => res.data),
  
  updateDepartmentMapping: (mappingId: string, data: UpdateCategoryDepartmentMappingDto): Promise<CategoryDepartmentMapping> =>
    api.patch(`/categories/departments/${mappingId}`, data).then((res) => res.data),
  
  deleteDepartmentMapping: (mappingId: string): Promise<{ message: string }> =>
    api.delete(`/categories/departments/${mappingId}`).then((res) => res.data),
  
  // Workflow operations
  getWorkflow: (categoryId: string): Promise<CategoryWorkflowDto> =>
    api.get(`/categories/${categoryId}/workflow`).then((res) => res.data),
  
  getNextDepartment: (categoryId: string, currentDept: string): Promise<string | null> =>
    api.get(`/categories/${categoryId}/next-department?currentDept=${currentDept}`).then((res) => res.data),
  
  bulkCreateDepartmentMappings: (categoryId: string, departments: any[]): Promise<CategoryDepartmentMapping[]> =>
    api.post(`/categories/${categoryId}/departments/bulk`, departments).then((res) => res.data),
};

// KT Meetings API
export const ktMeetingsApi = {
  // Get all KT meetings (with optional project filter)
  getAll: (projectId?: string): Promise<any[]> => {
    const params = projectId ? `?projectId=${projectId}` : '';
    return api.get(`/kt-meetings${params}`).then((res) => res.data);
  },

  // Get upcoming KT meetings
  getUpcoming: (days: number = 7): Promise<any[]> =>
    api.get(`/kt-meetings/upcoming?days=${days}`).then((res) => res.data),

  // Get specific KT meeting by ID
  getById: (id: string): Promise<any> =>
    api.get(`/kt-meetings/${id}`).then((res) => res.data),

  // Create new KT meeting
  create: (data: {
    projectId: string;
    scheduledDate: string;
    duration?: number;
    agenda?: string;
    meetingLink?: string;
    participantIds?: string[];
  }): Promise<any> =>
    api.post('/kt-meetings', data).then((res) => res.data),

  // Update KT meeting
  update: (id: string, data: {
    scheduledDate?: string;
    duration?: number;
    agenda?: string;
    meetingLink?: string;
    status?: string;
    notes?: string;
    completedAt?: string;
  }): Promise<any> =>
    api.patch(`/kt-meetings/${id}`, data).then((res) => res.data),

  // Delete KT meeting
  delete: (id: string): Promise<{ message: string }> =>
    api.delete(`/kt-meetings/${id}`).then((res) => res.data),

  // Add participant to KT meeting
  addParticipant: (meetingId: string, data: {
    userId: string;
    role?: string;
    isRequired?: boolean;
  }): Promise<any> =>
    api.post(`/kt-meetings/${meetingId}/participants`, data).then((res) => res.data),

  // Remove participant from KT meeting
  removeParticipant: (meetingId: string, userId: string): Promise<{ message: string }> =>
    api.delete(`/kt-meetings/${meetingId}/participants/${userId}`).then((res) => res.data),

  // Update participant details (attendance, role, etc.)
  updateParticipant: (meetingId: string, userId: string, data: {
    attended?: boolean;
    role?: string;
    isRequired?: boolean;
  }): Promise<any> =>
    api.patch(`/kt-meetings/${meetingId}/participants/${userId}`, data).then((res) => res.data),
};