import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Department, DepartmentWorkStatus } from '@/types';
import { projectsApi } from '@/lib/api';

interface WorkflowValidationStatus {
  currentDepartment: Department;
  currentStatus: DepartmentWorkStatus;
  allowedNextDepartments: Department[];
  workflowSequence: Department[];
  approvalGate: {
    required: boolean;
    satisfied: boolean;
    missingRequirements: string[];
  };
  canProceed: boolean;
}

interface WorkflowEnforcerProps {
  projectId: string;
  currentDepartment: Department;
  onDepartmentMove?: (department: Department) => void;
  canManageDepartments?: boolean;
}

export default function WorkflowEnforcer({ 
  projectId, 
  currentDepartment,
  onDepartmentMove,
  canManageDepartments = false 
}: WorkflowEnforcerProps) {
  const [validationStatus, setValidationStatus] = useState<WorkflowValidationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadValidationStatus();
  }, [projectId, currentDepartment]);

  const loadValidationStatus = async () => {
    try {
      setIsLoading(true);
      const status = await projectsApi.getWorkflowValidationStatus(projectId);
      setValidationStatus(status);
    } catch (error) {
      console.error('Failed to load workflow validation status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentMove = (department: Department) => {
    onDepartmentMove?.(department);
  };

  const formatDepartmentName = (dept: Department) => {
    return dept.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStatusName = (status: DepartmentWorkStatus) => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validationStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Unable to load workflow status</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔄</span>
            Workflow Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Department</p>
                <Badge variant="outline" className="mt-1">
                  {formatDepartmentName(validationStatus.currentDepartment)}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Work Status</p>
                <Badge className="mt-1" variant={
                  validationStatus.currentStatus === DepartmentWorkStatus.COMPLETED ? 'default' :
                  validationStatus.currentStatus === DepartmentWorkStatus.IN_PROGRESS ? 'secondary' :
                  'outline'
                }>
                  {formatStatusName(validationStatus.currentStatus)}
                </Badge>
              </div>
            </div>

            {/* Approval Gate Status */}
            {validationStatus.approvalGate.required && (
              <div className={`p-4 rounded-lg border ${
                validationStatus.approvalGate.satisfied 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {validationStatus.approvalGate.satisfied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-red-600" />
                  )}
                  <p className={`font-medium ${
                    validationStatus.approvalGate.satisfied ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationStatus.approvalGate.satisfied ? 'Approval Gates Satisfied' : 'Approval Gates Required'}
                  </p>
                </div>
                
                {!validationStatus.approvalGate.satisfied && (
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationStatus.approvalGate.missingRequirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {req}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {validationStatus.allowedNextDepartments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {validationStatus.canProceed 
                  ? 'Ready to proceed to the next department:'
                  : 'Complete requirements above before proceeding:'
                }
              </p>
              
              <div className="flex flex-wrap gap-2">
                {validationStatus.allowedNextDepartments.map(dept => (
                  <Button
                    key={dept}
                    variant={validationStatus.canProceed ? "default" : "outline"}
                    size="sm"
                    disabled={!validationStatus.canProceed || !canManageDepartments}
                    onClick={() => handleDepartmentMove(dept)}
                    className="flex items-center gap-2"
                  >
                    {validationStatus.canProceed ? (
                      <ArrowRight className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    Move to {formatDepartmentName(dept)}
                  </Button>
                ))}
              </div>

              {!validationStatus.canProceed && (
                <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Complete approval requirements above before proceeding</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            Workflow Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span>
                {validationStatus.workflowSequence.findIndex(d => d === validationStatus.currentDepartment) + 1} / {validationStatus.workflowSequence.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {validationStatus.workflowSequence.map((dept, index) => {
                const isCurrent = dept === validationStatus.currentDepartment;
                const isCompleted = validationStatus.workflowSequence.findIndex(d => d === validationStatus.currentDepartment) > index;
                const isNext = validationStatus.workflowSequence.findIndex(d => d === validationStatus.currentDepartment) === index - 1;
                
                return (
                  <div key={dept} className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                      ${isCompleted ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-blue-500 text-white' :
                        isNext ? 'bg-orange-200 text-orange-800' :
                        'bg-gray-200 text-gray-600'}
                    `}>
                      {index + 1}
                    </div>
                    {index < validationStatus.workflowSequence.length - 1 && (
                      <div className={`w-8 h-0.5 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex flex-wrap gap-1">
              {validationStatus.workflowSequence.map((dept, index) => {
                const isCurrent = dept === validationStatus.currentDepartment;
                const isCompleted = validationStatus.workflowSequence.findIndex(d => d === validationStatus.currentDepartment) > index;
                
                return (
                  <Badge 
                    key={dept}
                    variant={isCompleted ? 'default' : isCurrent ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {formatDepartmentName(dept)}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}