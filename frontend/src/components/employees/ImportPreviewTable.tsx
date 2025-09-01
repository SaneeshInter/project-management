import { CheckCircle, XCircle, AlertTriangle, User, Building2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ParsedEmployeeData, 
  ImportValidation, 
  DepartmentConflict,
  Role,
  Department
} from '@/types';
import { departmentUtils, employeeUtils } from '@/lib/employeeUtils';

interface ImportPreviewTableProps {
  data: ParsedEmployeeData[];
  validation: ImportValidation;
  onDepartmentResolution: (conflicts: DepartmentConflict[]) => void;
  showResolutionButton?: boolean;
}

export default function ImportPreviewTable({
  data,
  validation,
  onDepartmentResolution,
  showResolutionButton = true
}: ImportPreviewTableProps) {
  const getRowStatus = (employee: ParsedEmployeeData): {
    status: 'valid' | 'warning' | 'error';
    issues: string[];
  } => {
    const issues: string[] = [];
    let status: 'valid' | 'warning' | 'error' = 'valid';

    // Check for duplicates
    if (validation.duplicateEmployees.includes(employee.name.toLowerCase())) {
      issues.push('Duplicate employee name');
      status = 'error';
    }

    // Check for department issues
    if (employee.department && validation.missingDepartments.includes(employee.department as string)) {
      issues.push('Department not found');
      status = status === 'error' ? 'error' : 'warning';
    }

    // Check for missing required fields
    if (!employee.name.trim()) {
      issues.push('Missing name');
      status = 'error';
    }

    // Check for project issues
    if (employee.projects.length > 0 && validation.missingProjects.some(p => employee.projects.includes(p))) {
      issues.push('Some projects not found');
      status = status === 'error' ? 'error' : 'warning';
    }

    return { status, issues };
  };

  const getStatusIcon = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  const formatRole = (role: Role): string => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDepartment = (department?: Department): string => {
    if (!department) return 'Not assigned';
    return departmentUtils.formatDepartmentName(department);
  };


  const validRows = data.filter((employee) => getRowStatus(employee).status === 'valid');
  const warningRows = data.filter((employee) => getRowStatus(employee).status === 'warning');
  const errorRows = data.filter((employee) => getRowStatus(employee).status === 'error');

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.length}</div>
            <div className="text-sm text-muted-foreground">Total Employees</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{validRows.length}</div>
            <div className="text-sm text-muted-foreground">Valid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{warningRows.length}</div>
            <div className="text-sm text-muted-foreground">Warnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{errorRows.length}</div>
            <div className="text-sm text-muted-foreground">Errors</div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Issues */}
      {(!validation.isValid || validation.warnings.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Import Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Department Issues */}
            {validation.departmentConflicts.length > 0 && (
              <div>
                <h4 className="font-medium text-red-900 mb-2">Department Issues</h4>
                <div className="space-y-2">
                  {validation.departmentConflicts.map((conflict, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Unknown department: "{conflict.csvName}"</span>
                          {conflict.suggestion && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (Suggested: {departmentUtils.formatDepartmentName(conflict.suggestion)})
                            </span>
                          )}
                        </div>
                        {showResolutionButton && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDepartmentResolution(validation.departmentConflicts)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duplicate Issues */}
            {validation.duplicateEmployees.length > 0 && (
              <div>
                <h4 className="font-medium text-red-900 mb-2">Duplicate Employees</h4>
                <div className="flex flex-wrap gap-2">
                  {validation.duplicateEmployees.map((name, index) => (
                    <Badge key={index} variant="destructive">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Projects */}
            {validation.missingProjects.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">Projects to be Created</h4>
                <div className="flex flex-wrap gap-2">
                  {validation.missingProjects.slice(0, 10).map((project, index) => (
                    <Badge key={index} className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      {project}
                    </Badge>
                  ))}
                  {validation.missingProjects.length > 10 && (
                    <Badge className="bg-gray-100 text-gray-800">
                      +{validation.missingProjects.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Employee Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Preview ({data.length} employees)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.map((employee, index) => {
              const rowStatus = getRowStatus(employee);
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-all duration-200 ${getStatusColor(rowStatus.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Basic Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{employee.name}</span>
                          {getStatusIcon(rowStatus.status)}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Email: {employee.email}</div>
                          <div className="flex items-center gap-2">
                            Status: 
                            <Badge className={employeeUtils.getStatusColor(employee.status)}>
                              {employee.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Role & Department */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Role & Department</span>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Role: {formatRole(employee.role)}</div>
                          <div>Department: {formatDepartment(employee.department)}</div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Work Details</span>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Weekly: {employee.weeklyLimit || 'Not set'} hours</div>
                          <div>Daily: {employee.dailyLimit || 'Not set'} hours</div>
                          <div>Projects: {employee.projects.length}</div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          Row {index + 1}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Issues */}
                  {rowStatus.issues.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">Issues:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rowStatus.issues.map((issue, issueIndex) => (
                          <Badge 
                            key={issueIndex} 
                            variant={rowStatus.status === 'error' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {employee.projects.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm font-medium mb-2">
                        Projects ({employee.projects.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {employee.projects.slice(0, 5).map((project, projectIndex) => (
                          <Badge key={projectIndex} variant="outline" className="text-xs">
                            {project}
                          </Badge>
                        ))}
                        {employee.projects.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{employee.projects.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}