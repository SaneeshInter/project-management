// Enums
export enum Role {
  ADMIN = 'ADMIN',
  SU_ADMIN = 'SU_ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  PROJECT_COORDINATOR = 'PROJECT_COORDINATOR',
  DEVELOPER = 'DEVELOPER',
  DESIGNER = 'DESIGNER',
  HTML_DEVELOPER = 'HTML_DEVELOPER',
  QA_TESTER = 'QA_TESTER',
  CLIENT = 'CLIENT',
  PC = 'PC',
  TESTER = 'TESTER',
  PHP_TL1 = 'PHP_TL1',
  PHP_TL2 = 'PHP_TL2',
  REACT_TL = 'REACT_TL',
  HTML_TL = 'HTML_TL',
  PC_TL1 = 'PC_TL1',
  PC_TL2 = 'PC_TL2',
  DESIGN_TL = 'DESIGN_TL',
}

export enum ProjectCategory {
  MOBILE_APP = 'MOBILE_APP',
  REACT_NODEJS = 'REACT_NODEJS',
  ADVANCED_PHP = 'ADVANCED_PHP',
  CUSTOM_PHP = 'CUSTOM_PHP',
  CUSTOM_WP = 'CUSTOM_WP',
  NEXT_JS = 'NEXT_JS',
  ECOMMERCE = 'ECOMMERCE',
  NORMAL_WEB_APP = 'NORMAL_WEB_APP',
  BUSINESS_COLLATERAL = 'BUSINESS_COLLATERAL',
  WOOCOMMERCE = 'WOOCOMMERCE',
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  HOLD = 'HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum Office {
  KOCHI = 'KOCHI',
  DUBAI = 'DUBAI', 
  GERMANY = 'GERMANY',
}

export enum Department {
  PMO = 'PMO',
  DESIGN = 'DESIGN',
  HTML = 'HTML',
  PHP = 'PHP',
  REACT = 'REACT',
  WORDPRESS = 'WORDPRESS',
  QA = 'QA',
  DELIVERY = 'DELIVERY',
  MANAGER = 'MANAGER',
}

export enum DepartmentWorkStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  CORRECTIONS_NEEDED = 'CORRECTIONS_NEEDED',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  PENDING_CLIENT_APPROVAL = 'PENDING_CLIENT_APPROVAL',
  CLIENT_REJECTED = 'CLIENT_REJECTED', 
  QA_TESTING = 'QA_TESTING',
  QA_REJECTED = 'QA_REJECTED',
  BUGFIX_IN_PROGRESS = 'BUGFIX_IN_PROGRESS',
  BEFORE_LIVE_QA = 'BEFORE_LIVE_QA',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
}

export enum CorrectionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

// Master table types
export interface DepartmentMaster {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: DepartmentMaster;
  children?: DepartmentMaster[];
}

export interface RoleMaster {
  id: string;
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  department: DepartmentMaster;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  department?: Department;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  roleMaster?: RoleMaster;
  departmentMaster?: DepartmentMaster;
}

// Employee types (extends User with additional employee management fields)
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Employee extends User {
  status: EmployeeStatus;
  weeklyLimit?: number;
  dailyLimit?: number;
  trackingEnabled: boolean;
  timesheetsEnabled: boolean;
  countsTowardPricing: boolean;
  dateAdded: string;
  projectAssignments?: ProjectAssignment[];
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: Role;
  department?: Department;
  avatar?: string;
}

// Employee Creation DTO
export interface CreateEmployeeDto {
  name: string;
  email: string;
  password?: string;
  role: Role;
  status: EmployeeStatus;
  department?: Department;
  weeklyLimit?: number;
  dailyLimit?: number;
  trackingEnabled?: boolean;
  timesheetsEnabled?: boolean;
  countsTowardPricing?: boolean;
  avatar?: string;
}

// Project Assignment types
export enum ProjectAssignmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  REMOVED = 'REMOVED',
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  employeeId: string;
  assignedAt: string;
  assignedBy: string;
  assignedByUser?: User;
  role?: string;
  status: ProjectAssignmentStatus;
  removedAt?: string;
  removedBy?: string;
  removedByUser?: User;
  project?: Project;
  employee?: Employee;
}

// Auth types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
  role?: Role;
  avatar?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// Project types
export interface CustomField {
  id: string;
  fieldName: string;
  fieldValue: string;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  office: Office;
  category: ProjectCategory;
  pagesCount?: number;
  currentDepartment: Department;
  nextDepartment?: Department;
  projectCode: string;
  targetDate: string;
  status: ProjectStatus;
  clientName?: string;
  observations?: string;
  monthsPassed: number;
  startDate: string;
  deviationReason?: string;
  dependency: boolean;
  createdAt: string;
  updatedAt: string;
  owner: User;
  ownerId: string;
  projectCoordinatorId?: string;
  pcTeamLeadId?: string;
  projectCoordinator?: User;
  pcTeamLead?: User;
  customFields?: CustomField[];
  tasks?: Task[];
  comments?: Comment[];
  departmentHistory?: ProjectDepartmentHistory[];
  assignments?: ProjectAssignment[];
  assignmentHistory?: ProjectAssignmentHistory[];
  _count?: {
    tasks: number;
    comments: number;
    assignments: number;
  };
}

export interface CreateProjectDto {
  name: string;
  office: string;
  category: ProjectCategory;
  pagesCount?: number;
  currentDepartmentId: string;
  nextDepartmentId?: string;
  targetDate: string;
  status?: ProjectStatus;
  clientName?: string;
  observations?: string;
  deviationReason?: string;
  dependency?: boolean;
  startDate?: string;
  projectCoordinatorId?: string;
  pcTeamLeadId?: string;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  assigneeId?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  assignee?: User;
  project?: {
    id: string;
    name: string;
    ownerId?: string;
  };
  comments?: Comment[];
  _count?: {
    comments: number;
  };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  assigneeId?: string;
  projectId: string;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  projectId?: string;
  taskId?: string;
  createdAt: string;
  author: User;
  project?: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    title: string;
  };
}

export interface CreateCommentDto {
  content: string;
  projectId?: string;
  taskId?: string;
}

// Department History types
export interface ProjectDepartmentHistory {
  id: string;
  projectId: string;
  fromDepartment?: Department;
  toDepartment: Department;
  workStatus: DepartmentWorkStatus;
  workStartDate?: string;
  workEndDate?: string;
  estimatedDays?: number;
  actualDays?: number;
  correctionCount: number;
  movedBy: User;
  movedById: string;
  permissionGrantedBy?: User;
  permissionGrantedById?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  corrections?: DepartmentCorrection[];
  approvals?: WorkflowApproval[];
  qaRounds?: QATestingRound[];
}

export interface CreateDepartmentTransitionDto {
  toDepartment: Department;
  estimatedDays?: number;
  permissionGrantedById?: string;
  notes?: string;
}

export interface UpdateDepartmentWorkStatusDto {
  workStatus: DepartmentWorkStatus;
  workStartDate?: string;
  workEndDate?: string;
  actualDays?: number;
  notes?: string;
}

// Correction types
export interface DepartmentCorrection {
  id: string;
  historyId: string;
  correctionType: string;
  description: string;
  requestedBy: User;
  requestedById: string;
  assignedTo?: User;
  assignedToId?: string;
  status: CorrectionStatus;
  priority: Priority;
  requestedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  estimatedHours?: number;
  actualHours?: number;
  departmentHistory?: {
    toDepartment: string;
    fromDepartment?: string;
    createdAt: string;
  };
}

// New Workflow Enhancements
export enum ApprovalType {
  CLIENT_APPROVAL = 'CLIENT_APPROVAL',
  QA_APPROVAL = 'QA_APPROVAL',
  BEFORE_LIVE_QA = 'BEFORE_LIVE_QA',
  MANAGER_REVIEW = 'MANAGER_REVIEW',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum QAType {
  HTML_QA = 'HTML_QA',
  DEV_QA = 'DEV_QA',
  BEFORE_LIVE_QA = 'BEFORE_LIVE_QA',
}

export enum QAStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum BugSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum BugStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  FIXED = 'FIXED',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED',
}

export interface WorkflowApproval {
  id: string;
  historyId: string;
  approvalType: ApprovalType;
  status: ApprovalStatus;
  requestedBy: User;
  requestedById: string;
  reviewedBy?: User;
  reviewedById?: string;
  requestedAt: string;
  reviewedAt?: string;
  comments?: string;
  rejectionReason?: string;
  attachments: string[];
}

export interface QATestingRound {
  id: string;
  historyId: string;
  roundNumber: number;
  qaType: QAType;
  status: QAStatus;
  startedAt: string;
  completedAt?: string;
  testedBy: User;
  testedById: string;
  bugsFound: number;
  criticalBugs: number;
  testResults?: string;
  rejectionReason?: string;
  bugs?: QABug[];
}

export interface QABug {
  id: string;
  qaRoundId: string;
  title: string;
  description: string;
  severity: BugSeverity;
  status: BugStatus;
  foundAt: string;
  fixedAt?: string;
  assignedTo?: User;
  assignedToId?: string;
  screenshot?: string;
  steps?: string;
}

// DTOs for new workflow features
export interface CreateApprovalDto {
  approvalType: ApprovalType;
  comments?: string;
  attachments?: string[];
}

export interface UpdateApprovalDto {
  status: ApprovalStatus;
  comments?: string;
  rejectionReason?: string;
}

export interface CreateQATestingRoundDto {
  qaType: QAType;
  testedById: string;
  testResults?: string;
}

export interface UpdateQATestingRoundDto {
  status: QAStatus;
  completedAt?: string;
  bugsFound?: number;
  criticalBugs?: number;
  testResults?: string;
  rejectionReason?: string;
}

export interface CreateQABugDto {
  title: string;
  description: string;
  severity: BugSeverity;
  assignedToId?: string;
  screenshot?: string;
  steps?: string;
}

export interface CreateCorrectionDto {
  correctionType: string;
  description: string;
  assignedToId?: string;
  priority?: Priority;
  estimatedHours?: number;
}

export interface UpdateCorrectionDto {
  status?: CorrectionStatus;
  assignedToId?: string;
  resolutionNotes?: string;
  actualHours?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

// Dashboard types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  overdueTasks: number;
  myTasks: number;
}

// Utility types
export type UpdateProjectDto = Partial<CreateProjectDto>;
export type UpdateTaskDto = Partial<CreateTaskDto>;
export type UpdateUserDto = Partial<CreateUserDto>;
export type UpdateCommentDto = Partial<CreateCommentDto>;

// Timeline Analytics types
export interface ProjectTimelineAnalytics {
  projectId: string;
  totalDuration: number; // days
  departmentBreakdown: DepartmentAnalytics[];
  totalCorrections: number;
  averageResolutionTime: number; // hours
  estimateAccuracy: number; // percentage
  bottlenecks: string[]; // departments taking longer than average
}

export interface DepartmentAnalytics {
  department: Department;
  estimatedDays?: number;
  actualDays?: number;
  workStartDate?: string;
  workEndDate?: string;
  correctionCount: number;
  status: DepartmentWorkStatus;
  efficiency: number; // percentage (actual vs estimated)
}

// CSV Import types
export interface CSVEmployeeRow {
  Name: string;
  Status: string;
  Role: string;
  Department?: string;
  'Date added'?: string;
  'Weekly limit'?: string;
  'Daily limit'?: string;
  'Tracking enabled'?: string;
  'Timesheets enabled'?: string;
  'Counts toward pricing plan'?: string;
  Projects?: string;
}

export interface ParsedEmployeeData {
  name: string;
  status: EmployeeStatus;
  role: Role;
  department?: Department;
  dateAdded?: string;
  weeklyLimit?: number;
  dailyLimit?: number;
  trackingEnabled: boolean;
  timesheetsEnabled: boolean;
  countsTowardPricing: boolean;
  projects: string[];
  email?: string; // Will be generated if not provided
}

export interface ImportValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredFields: string[];
  duplicateEmployees: string[];
  missingDepartments: string[];
  invalidDepartments: string[];
  missingProjects: string[];
  invalidRoles: string[];
  departmentConflicts: DepartmentConflict[];
}

export interface DepartmentConflict {
  csvName: string;
  possibleMatches: Department[];
  suggestion?: Department;
  resolved?: boolean;
  resolution?: Department | 'CREATE_NEW' | 'SKIP';
}

export interface ImportOptions {
  createMissingDepartments: boolean;
  defaultDepartment?: Department;
  departmentMapping: Record<string, Department>;
  skipInvalidRows: boolean;
  generateEmails: boolean;
  emailDomain: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  createdEmployees: Employee[];
  createdDepartments: string[];
  errors: ImportError[];
  warnings: string[];
  summary: ImportSummary;
}

export interface ImportError {
  row: number;
  field?: string;
  value?: string;
  message: string;
  type: 'VALIDATION' | 'DUPLICATE' | 'MISSING_DATA' | 'SYSTEM_ERROR';
}

export interface ImportSummary {
  employeesCreated: number;
  departmentsCreated: number;
  projectAssignments: number;
  duplicatesSkipped: number;
  errorsEncountered: number;
}

export interface ImportLog {
  id: string;
  filename: string;
  importedBy: string;
  importedAt: string;
  totalRows: number;
  successCount: number;
  failureCount: number;
  options: ImportOptions;
  result: ImportResult;
  errors: ImportError[];
}

// Project Assignment DTOs
export interface CreateProjectAssignmentDto {
  projectId: string;
  employeeId: string;
  role?: string;
}

export interface BulkAssignProjectDto {
  projectId: string;
  employeeIds: string[];
  role?: string;
}

export interface UpdateProjectAssignmentDto {
  role?: string;
  status?: ProjectAssignmentStatus;
}

// Project Assignment History types
export enum ProjectAssignmentType {
  PROJECT_COORDINATOR = 'PROJECT_COORDINATOR',
  PC_TEAM_LEAD = 'PC_TEAM_LEAD',
}

export interface ProjectAssignmentHistory {
  id: string;
  projectId: string;
  assignmentType: ProjectAssignmentType;
  previousUserId?: string;
  newUserId?: string;
  assignedById: string;
  assignedAt: string;
  reason?: string;
  notes?: string;
  previousUser?: User;
  assignedBy: User;
}

export interface ReassignPCDto {
  assignmentType: 'PROJECT_COORDINATOR' | 'PC_TEAM_LEAD';
  newUserId: string;
  reason?: string;
  notes?: string;
}

// Department Checklist types
export interface DepartmentChecklistTemplate {
  id: string;
  department: Department;
  title: string;
  description?: string;
  isRequired: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItemLink {
  id: string;
  url: string;
  title: string;
  type: 'document' | 'link' | 'reference';
  addedAt: string;
  addedBy?: User;
}

export interface ChecklistItemUpdate {
  id: string;
  date: string;
  notes: string;
  updatedBy: User;
  updatedAt: string;
}

export interface ProjectChecklistItem {
  id: string;
  projectId: string;
  templateId: string;
  department: Department;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedBy?: User;
  completedById?: string;
  completedAt?: string;
  completedDate?: string;
  notes?: string;
  isRequired: boolean;
  order: number;
  template: DepartmentChecklistTemplate;
  links?: ChecklistItemLink[];
  updateHistory?: ChecklistItemUpdate[];
  lastUpdatedAt?: string;
  lastUpdatedBy?: User;
}

export interface DepartmentChecklistProgress {
  department: Department;
  totalItems: number;
  completedItems: number;
  requiredItems: number;
  completedRequiredItems: number;
  completionPercentage: number;
  requiredCompletionPercentage: number;
  canProceedToNext: boolean;
  items: ProjectChecklistItem[];
}

export interface CreateChecklistItemDto {
  templateId: string;
  notes?: string;
}

export interface UpdateChecklistItemDto {
  isCompleted: boolean;
  completedDate?: string;
  notes?: string;
  links?: Array<{
    url: string;
    title: string;
    type: 'document' | 'link' | 'reference';
  }>;
}

export interface CreateChecklistItemLinkDto {
  url: string;
  title: string;
  type: 'document' | 'link' | 'reference';
}

export interface CreateChecklistItemUpdateDto {
  date: string;
  notes: string;
}