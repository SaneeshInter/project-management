import { 
  Employee, 
  Department, 
  Role, 
  EmployeeStatus, 
  CSVEmployeeRow, 
  ParsedEmployeeData, 
  ImportValidation,
  DepartmentConflict,
  ImportError 
} from '@/types';

// Department management utilities
export const departmentUtils = {
  // Get all existing departments
  getAllDepartments(): Department[] {
    return Object.values(Department);
  },

  // Check if department exists
  departmentExists(departmentName: string): boolean {
    return Object.values(Department).some(
      dept => dept.toLowerCase() === departmentName.toLowerCase()
    );
  },

  // Find similar departments
  findSimilarDepartments(searchTerm: string): Department[] {
    const term = searchTerm.toLowerCase();
    return Object.values(Department).filter(dept => 
      dept.toLowerCase().includes(term) || 
      term.includes(dept.toLowerCase())
    );
  },

  // Suggest department mapping
  suggestDepartmentMapping(csvDeptName: string): Department | null {
    const term = csvDeptName.toLowerCase().trim();
    
    // Direct mapping attempts
    const directMappings: Record<string, Department> = {
      'design': Department.DESIGN,
      'html': Department.HTML,
      'php': Department.PHP,
      'react': Department.REACT,
      'wordpress': Department.WORDPRESS,
      'wp': Department.WORDPRESS,
      'qa': Department.QA,
      'testing': Department.QA,
      'delivery': Department.DELIVERY,
      'pmo': Department.PMO,
      'project': Department.PMO,
      'management': Department.PMO,
    };

    if (directMappings[term]) {
      return directMappings[term];
    }

    // Fuzzy matching
    const similarities = Object.values(Department).map(dept => {
      const deptLower = dept.toLowerCase();
      const similarity = calculateStringSimilarity(term, deptLower);
      return { department: dept, similarity };
    });

    const best = similarities.sort((a, b) => b.similarity - a.similarity)[0];
    return best.similarity > 0.6 ? best.department : null;
  },

  // Format department name for display
  formatDepartmentName(department: Department): string {
    return department.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  },

  // Validate department string
  validateDepartment(departmentString: string): { isValid: boolean; department?: Department } {
    const exists = this.departmentExists(departmentString);
    if (exists) {
      const dept = Object.values(Department).find(d => 
        d.toLowerCase() === departmentString.toLowerCase()
      );
      return { isValid: true, department: dept };
    }
    return { isValid: false };
  }
};

// CSV parsing utilities
export const csvUtils = {
  // Parse CSV employee row
  parseEmployeeRow(row: CSVEmployeeRow, rowIndex: number): {
    data: ParsedEmployeeData | null;
    errors: ImportError[];
    warnings: string[];
  } {
    const errors: ImportError[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!row.Name?.trim()) {
      errors.push({
        row: rowIndex,
        field: 'Name',
        message: 'Employee name is required',
        type: 'VALIDATION'
      });
    }

    if (!row.Status?.trim()) {
      errors.push({
        row: rowIndex,
        field: 'Status',
        message: 'Employee status is required',
        type: 'VALIDATION'
      });
    }

    if (!row.Role?.trim()) {
      errors.push({
        row: rowIndex,
        field: 'Role',
        message: 'Employee role is required',
        type: 'VALIDATION'
      });
    }

    if (errors.length > 0) {
      return { data: null, errors, warnings };
    }

    try {
      const data: ParsedEmployeeData = {
        name: row.Name.trim(),
        status: this.parseEmployeeStatus(row.Status.trim()),
        role: this.parseRole(row.Role.trim()),
        department: row.Department ? this.parseDepartment(row.Department.trim()) : undefined,
        dateAdded: row['Date added'] || new Date().toISOString(),
        weeklyLimit: row['Weekly limit'] ? parseInt(row['Weekly limit']) : undefined,
        dailyLimit: row['Daily limit'] ? parseInt(row['Daily limit']) : undefined,
        trackingEnabled: this.parseBoolean(row['Tracking enabled'], true),
        timesheetsEnabled: this.parseBoolean(row['Timesheets enabled'], false),
        countsTowardPricing: this.parseBoolean(row['Counts toward pricing plan'], true),
        projects: this.parseProjects(row.Projects || ''),
        email: this.generateEmail(row.Name.trim())
      };

      return { data, errors, warnings };
    } catch (error) {
      errors.push({
        row: rowIndex,
        message: `Failed to parse employee data: ${error}`,
        type: 'SYSTEM_ERROR'
      });
      return { data: null, errors, warnings };
    }
  },

  // Parse employee status
  parseEmployeeStatus(status: string): EmployeeStatus {
    const statusUpper = status.toUpperCase().trim();
    if (statusUpper === 'ACTIVE') return EmployeeStatus.ACTIVE;
    if (statusUpper === 'INACTIVE') return EmployeeStatus.INACTIVE;
    throw new Error(`Invalid employee status: ${status}`);
  },

  // Parse role
  parseRole(role: string): Role {
    const roleUpper = role.toUpperCase().trim();
    const roleMapping: Record<string, Role> = {
      'ADMIN': Role.ADMIN,
      'PROJECT_MANAGER': Role.PROJECT_MANAGER,
      'MANAGER': Role.PROJECT_MANAGER,
      'DEVELOPER': Role.DEVELOPER,
      'DEV': Role.DEVELOPER,
      'DESIGNER': Role.DESIGNER,
      'DESIGN': Role.DESIGNER,
      'CLIENT': Role.CLIENT,
      'USER': Role.DEVELOPER, // Default mapping
    };

    if (roleMapping[roleUpper]) {
      return roleMapping[roleUpper];
    }
    throw new Error(`Invalid role: ${role}`);
  },

  // Parse department
  parseDepartment(department: string): Department | undefined {
    if (!department) return undefined;
    const validation = departmentUtils.validateDepartment(department);
    if (validation.isValid) {
      return validation.department;
    }
    // Return undefined for invalid departments - they'll be handled in validation
    return undefined;
  },

  // Parse boolean values
  parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (!value) return defaultValue;
    const valueLower = value.toLowerCase().trim();
    if (['true', 'yes', '1', 'on', 'enabled'].includes(valueLower)) return true;
    if (['false', 'no', '0', 'off', 'disabled'].includes(valueLower)) return false;
    return defaultValue;
  },

  // Parse projects string
  parseProjects(projectsString: string): string[] {
    if (!projectsString.trim()) return [];
    return projectsString.split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  },

  // Generate email from name
  generateEmail(name: string): string {
    const cleanName = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '.');
    return `${cleanName}@company.com`;
  }
};

// Validation utilities
export const validationUtils = {
  // Validate parsed employee data
  validateEmployeeData(
    employees: ParsedEmployeeData[], 
    existingEmployees: Employee[] = []
  ): ImportValidation {
    const validation: ImportValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      requiredFields: [],
      duplicateEmployees: [],
      missingDepartments: [],
      invalidDepartments: [],
      missingProjects: [],
      invalidRoles: [],
      departmentConflicts: [],
    };

    // Check for duplicates within CSV
    const nameMap = new Map<string, number[]>();
    employees.forEach((emp, index) => {
      const nameLower = emp.name.toLowerCase();
      if (!nameMap.has(nameLower)) {
        nameMap.set(nameLower, []);
      }
      nameMap.get(nameLower)!.push(index);
    });

    nameMap.forEach((indices, name) => {
      if (indices.length > 1) {
        validation.duplicateEmployees.push(name);
        validation.errors.push(`Duplicate employee name found: ${name} (rows: ${indices.map(i => i + 1).join(', ')})`);
      }
    });

    // Check for duplicates with existing employees
    employees.forEach((emp, _index) => {
      const existing = existingEmployees.find(e => 
        e.name.toLowerCase() === emp.name.toLowerCase() ||
        e.email.toLowerCase() === emp.email?.toLowerCase()
      );
      if (existing) {
        validation.duplicateEmployees.push(emp.name);
        validation.errors.push(`Employee already exists: ${emp.name}`);
      }
    });

    // Check for missing/invalid departments
    const departmentIssues = new Map<string, number>();
    employees.forEach((emp, _index) => {
      if (emp.department) {
        if (!departmentUtils.departmentExists(emp.department as string)) {
          const deptName = emp.department as string;
          if (!departmentIssues.has(deptName)) {
            departmentIssues.set(deptName, 0);
          }
          departmentIssues.set(deptName, departmentIssues.get(deptName)! + 1);
        }
      }
    });

    // Create department conflicts
    departmentIssues.forEach((_count, deptName) => {
      validation.missingDepartments.push(deptName);
      const similar = departmentUtils.findSimilarDepartments(deptName);
      const suggestion = departmentUtils.suggestDepartmentMapping(deptName);
      
      validation.departmentConflicts.push({
        csvName: deptName,
        possibleMatches: similar,
        suggestion: suggestion || undefined,
        resolved: false,
      });
    });

    // Collect all unique projects
    const allProjects = new Set<string>();
    employees.forEach(emp => {
      emp.projects.forEach(project => allProjects.add(project));
    });

    // For now, we'll assume all projects are valid
    // In a real implementation, you'd check against existing projects
    validation.missingProjects = Array.from(allProjects);

    validation.isValid = validation.errors.length === 0;
    return validation;
  },

  // Resolve department conflicts
  resolveDepartmentConflicts(
    conflicts: DepartmentConflict[],
    resolutions: Record<string, Department | 'CREATE_NEW' | 'SKIP'>
  ): DepartmentConflict[] {
    return conflicts.map(conflict => ({
      ...conflict,
      resolved: true,
      resolution: resolutions[conflict.csvName]
    }));
  }
};

// Helper function for string similarity
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Employee management utilities
export const employeeUtils = {
  // Format employee name
  formatEmployeeName(employee: Employee): string {
    return employee.name;
  },

  // Get employee status color
  getStatusColor(status: EmployeeStatus): string {
    switch (status) {
      case EmployeeStatus.ACTIVE:
        return 'bg-green-100 text-green-800 border-green-300';
      case EmployeeStatus.INACTIVE:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  },

  // Calculate workload
  calculateWorkload(employee: Employee): {
    projectCount: number;
    utilizationPercentage: number;
    isOverloaded: boolean;
  } {
    const projectCount = employee.projectAssignments?.filter(
      assignment => assignment.status === 'ACTIVE'
    ).length || 0;

    const maxProjects = 5; // Default max projects per employee
    const utilizationPercentage = (projectCount / maxProjects) * 100;
    const isOverloaded = utilizationPercentage > 100;

    return {
      projectCount,
      utilizationPercentage: Math.min(utilizationPercentage, 100),
      isOverloaded
    };
  },

  // Filter employees by department
  filterByDepartment(employees: Employee[], department: Department | 'ALL'): Employee[] {
    if (department === 'ALL') return employees;
    return employees.filter(emp => emp.department === department);
  },

  // Filter employees by status
  filterByStatus(employees: Employee[], status: EmployeeStatus | 'ALL'): Employee[] {
    if (status === 'ALL') return employees;
    return employees.filter(emp => emp.status === status);
  },

  // Search employees
  searchEmployees(employees: Employee[], searchTerm: string): Employee[] {
    if (!searchTerm.trim()) return employees;
    const term = searchTerm.toLowerCase();
    
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.role.toLowerCase().includes(term) ||
      (emp.department && emp.department.toLowerCase().includes(term))
    );
  }
};