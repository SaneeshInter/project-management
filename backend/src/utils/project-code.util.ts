import { Department, DepartmentWorkStatus } from '@prisma/client';

// Department code mapping - using unique letters to avoid conflicts
const DEPARTMENT_CODES: Record<Department, string> = {
  [Department.PMO]: 'P',
  [Department.DESIGN]: 'D', 
  [Department.HTML]: 'H',
  [Department.PHP]: 'F', // Using F to distinguish from PMO (P)
  [Department.REACT]: 'R',
  [Department.WORDPRESS]: 'W',
  [Department.QA]: 'Q',
  [Department.DELIVERY]: 'L', // Using L to distinguish from DESIGN (D)
  [Department.MANAGER]: 'M',
};

export interface DepartmentHistoryForCode {
  toDepartment: Department;
  workStatus: DepartmentWorkStatus;
  createdAt: Date;
}

/**
 * Generates a project code based on completed departments
 * @param departmentHistory Array of department history entries
 * @returns Project code string (e.g., "DQH", "DQHQL")
 */
export function generateProjectCode(departmentHistory: DepartmentHistoryForCode[]): string {
  if (!departmentHistory || departmentHistory.length === 0) {
    return '';
  }

  // Sort by creation date to ensure proper order
  const sortedHistory = departmentHistory
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Get codes for completed departments only
  const completedDepartmentCodes = sortedHistory
    .filter(history => history.workStatus === DepartmentWorkStatus.COMPLETED)
    .map(history => DEPARTMENT_CODES[history.toDepartment])
    .filter(code => code); // Remove undefined codes

  return completedDepartmentCodes.join('');
}

/**
 * Get the code for a specific department
 * @param department Department enum value
 * @returns Single letter code for the department
 */
export function getDepartmentCode(department: Department): string {
  return DEPARTMENT_CODES[department] || '';
}

/**
 * Get all department codes mapping for reference
 * @returns Object with department names and their codes
 */
export function getAllDepartmentCodes(): Record<string, string> {
  const codes: Record<string, string> = {};
  Object.entries(DEPARTMENT_CODES).forEach(([dept, code]) => {
    codes[dept] = code;
  });
  return codes;
}