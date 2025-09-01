import Papa from 'papaparse';
import { 
  CSVEmployeeRow, 
  ParsedEmployeeData, 
  ImportValidation,
  ImportResult,
  ImportOptions,
  ImportError,
  Employee
} from '@/types';
import { csvUtils, validationUtils } from './employeeUtils';

export interface CSVParseResult {
  data: ParsedEmployeeData[];
  validation: ImportValidation;
  errors: ImportError[];
  warnings: string[];
}

export class CSVImportService {
  // Parse CSV file
  static async parseCSVFile(file: File): Promise<CSVParseResult> {
    return new Promise((resolve, reject) => {
      Papa.parse<CSVEmployeeRow>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // Normalize headers
          return header.trim();
        },
        complete: (results) => {
          try {
            const parseResult = this.processCSVData(results.data);
            resolve(parseResult);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  }

  // Process parsed CSV data
  private static processCSVData(csvData: CSVEmployeeRow[]): CSVParseResult {
    const parsedEmployees: ParsedEmployeeData[] = [];
    const allErrors: ImportError[] = [];
    const allWarnings: string[] = [];

    // Parse each row
    csvData.forEach((row, index) => {
      const parseResult = csvUtils.parseEmployeeRow(row, index + 1);
      
      if (parseResult.data) {
        parsedEmployees.push(parseResult.data);
      }
      
      allErrors.push(...parseResult.errors);
      allWarnings.push(...parseResult.warnings);
    });

    // Validate all parsed data
    const validation = validationUtils.validateEmployeeData(parsedEmployees);

    return {
      data: parsedEmployees,
      validation,
      errors: [...allErrors, ...validation.errors.map(err => ({
        row: 0,
        message: err,
        type: 'VALIDATION' as const
      }))],
      warnings: [...allWarnings, ...validation.warnings]
    };
  }

  // Generate CSV template
  static generateCSVTemplate(): string {
    const headers = [
      'Name',
      'Status',
      'Role',
      'Department',
      'Date added',
      'Weekly limit',
      'Daily limit',
      'Tracking enabled',
      'Timesheets enabled',
      'Counts toward pricing plan',
      'Projects'
    ];

    const sampleData = [
      {
        'Name': 'John Doe',
        'Status': 'Active',
        'Role': 'Developer',
        'Department': 'REACT',
        'Date added': '2024-01-15 10:00:00 +0530',
        'Weekly limit': '40',
        'Daily limit': '8',
        'Tracking enabled': 'true',
        'Timesheets enabled': 'false',
        'Counts toward pricing plan': 'YES',
        'Projects': 'Project A, Project B'
      },
      {
        'Name': 'Jane Smith',
        'Status': 'Active',
        'Role': 'Designer',
        'Department': 'DESIGN',
        'Date added': '2024-01-20 09:30:00 +0530',
        'Weekly limit': '40',
        'Daily limit': '8',
        'Tracking enabled': 'true',
        'Timesheets enabled': 'true',
        'Counts toward pricing plan': 'YES',
        'Projects': 'Project C'
      }
    ];

    return Papa.unparse({
      fields: headers,
      data: sampleData
    });
  }

  // Download CSV template
  static downloadCSVTemplate() {
    const csvContent = this.generateCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'employee_import_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Validate file format
  static validateFileFormat(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return { isValid: false, error: 'File must be in CSV format' };
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return { isValid: false, error: 'File size must be less than 5MB' };
    }

    return { isValid: true };
  }

  // Process import with options
  static async processImport(
    parsedData: ParsedEmployeeData[],
    validation: ImportValidation,
    options: ImportOptions,
    existingProjects: { id: string; name: string }[] = []
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRows: parsedData.length,
      processedRows: 0,
      successCount: 0,
      failureCount: 0,
      skippedCount: 0,
      createdEmployees: [],
      createdDepartments: [],
      errors: [],
      warnings: [],
      summary: {
        employeesCreated: 0,
        departmentsCreated: 0,
        projectAssignments: 0,
        duplicatesSkipped: 0,
        errorsEncountered: 0,
      }
    };

    try {
      // Process each employee
      for (let i = 0; i < parsedData.length; i++) {
        const employeeData = parsedData[i];
        
        try {
          // Skip invalid rows if option is set
          if (options.skipInvalidRows && validation.errors.some(e => e.includes(employeeData.name))) {
            result.skippedCount++;
            continue;
          }

          // Create employee (this would call the API in real implementation)
          const createdEmployee = await this.createEmployeeFromData(employeeData, options);
          
          if (createdEmployee) {
            result.createdEmployees.push(createdEmployee);
            result.successCount++;
            
            // Handle project assignments
            if (employeeData.projects.length > 0) {
              const assignments = await this.assignEmployeeToProjects(
                createdEmployee.id,
                employeeData.projects,
                existingProjects
              );
              result.summary.projectAssignments += assignments;
            }
          }
          
          result.processedRows++;
        } catch (error) {
          result.failureCount++;
          result.errors.push({
            row: i + 1,
            message: `Failed to process employee ${employeeData.name}: ${error}`,
            type: 'SYSTEM_ERROR'
          });
        }
      }

      // Handle department creation
      if (options.createMissingDepartments && validation.missingDepartments.length > 0) {
        for (const deptName of validation.missingDepartments) {
          if (!validation.departmentConflicts.some(c => c.resolution === 'SKIP' && c.csvName === deptName)) {
            result.createdDepartments.push(deptName);
            result.summary.departmentsCreated++;
          }
        }
      }

      result.summary.employeesCreated = result.successCount;
      result.summary.duplicatesSkipped = result.skippedCount;
      result.summary.errorsEncountered = result.failureCount;
      result.success = result.failureCount === 0;

      return result;
    } catch (error) {
      result.errors.push({
        row: 0,
        message: `Import process failed: ${error}`,
        type: 'SYSTEM_ERROR'
      });
      return result;
    }
  }

  // Mock employee creation (replace with actual API call)
  private static async createEmployeeFromData(
    employeeData: ParsedEmployeeData,
    options: ImportOptions
  ): Promise<Employee> {
    // This would be replaced with actual API call
    const mockEmployee: Employee = {
      id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: employeeData.email || `${employeeData.name.toLowerCase().replace(/\s+/g, '.')}@${options.emailDomain}`,
      name: employeeData.name,
      role: employeeData.role,
      department: employeeData.department,
      status: employeeData.status,
      weeklyLimit: employeeData.weeklyLimit,
      dailyLimit: employeeData.dailyLimit,
      trackingEnabled: employeeData.trackingEnabled,
      timesheetsEnabled: employeeData.timesheetsEnabled,
      countsTowardPricing: employeeData.countsTowardPricing,
      dateAdded: employeeData.dateAdded || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectAssignments: []
    };

    return mockEmployee;
  }

  // Mock project assignment (replace with actual API call)
  private static async assignEmployeeToProjects(
    _employeeId: string,
    projectNames: string[],
    existingProjects: { id: string; name: string }[]
  ): Promise<number> {
    let assignmentCount = 0;
    
    for (const projectName of projectNames) {
      const project = existingProjects.find(p => 
        p.name.toLowerCase().trim() === projectName.toLowerCase().trim()
      );
      
      if (project) {
        // Mock assignment - in real implementation, call assignment API
        assignmentCount++;
      }
    }
    
    return assignmentCount;
  }

  // Export employees to CSV
  static exportEmployeesToCSV(employees: Employee[], filename: string = 'employees_export.csv') {
    const exportData = employees.map(emp => ({
      'Name': emp.name,
      'Email': emp.email,
      'Status': emp.status,
      'Role': emp.role,
      'Department': emp.department || '',
      'Date Added': emp.dateAdded || emp.createdAt,
      'Weekly Limit': emp.weeklyLimit || '',
      'Daily Limit': emp.dailyLimit || '',
      'Tracking Enabled': emp.trackingEnabled ? 'true' : 'false',
      'Timesheets Enabled': emp.timesheetsEnabled ? 'true' : 'false',
      'Counts Toward Pricing': emp.countsTowardPricing ? 'YES' : 'NO',
      'Projects': emp.projectAssignments?.map(assignment => 
        assignment.project?.name || ''
      ).filter(Boolean).join(', ') || '',
      'Project Count': emp.projectAssignments?.filter(a => a.status === 'ACTIVE').length || 0
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}

// Helper functions for file operations
export const fileUtils = {
  // Read file as text
  readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate file extension
  hasValidExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  }
};