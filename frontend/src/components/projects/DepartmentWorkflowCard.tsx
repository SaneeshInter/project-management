import { useState } from 'react';
import { ArrowRight, Clock, Users, History, CheckCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project, Department, CreateDepartmentTransitionDto } from '@/types';
import { projectsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import AlertDialog from '@/components/ui/alert-dialog';
import { standardizeErrorMessage, getErrorSuggestion } from '@/lib/errorMessages';

interface DepartmentWorkflowCardProps {
  project: Project;
  onUpdate?: (updatedProject: Project) => void;
  canManageDepartments?: boolean;
}

const departmentColors: Record<Department, string> = {
  [Department.PMO]: 'bg-blue-100 text-blue-800',
  [Department.DESIGN]: 'bg-purple-100 text-purple-800',
  [Department.HTML]: 'bg-orange-100 text-orange-800',
  [Department.PHP]: 'bg-indigo-100 text-indigo-800',
  [Department.REACT]: 'bg-cyan-100 text-cyan-800',
  [Department.WORDPRESS]: 'bg-green-100 text-green-800',
  [Department.QA]: 'bg-yellow-100 text-yellow-800',
  [Department.DELIVERY]: 'bg-emerald-100 text-emerald-800',
  [Department.MANAGER]: 'bg-red-100 text-red-800',
};

const departmentOrder: Department[] = [
  Department.PMO,
  Department.DESIGN,
  Department.HTML,
  Department.PHP,
  Department.REACT,
  Department.WORDPRESS,
  Department.QA,
  Department.DELIVERY,
  Department.MANAGER,
];

export default function DepartmentWorkflowCard({ 
  project, 
  onUpdate, 
  canManageDepartments = false 
}: DepartmentWorkflowCardProps) {
  const [isMoving, setIsMoving] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [transitionNotes, setTransitionNotes] = useState('');
  const [errorAlert, setErrorAlert] = useState<{ title: string; message: string; suggestion?: string } | null>(null);

  const currentIndex = departmentOrder.indexOf(project.currentDepartment);
  const suggestedNext = currentIndex < departmentOrder.length - 1 
    ? departmentOrder[currentIndex + 1] 
    : null;

  const handleMoveToDepartment = async (toDepartment: Department, notes?: string) => {
    if (!canManageDepartments) return;
    
    setIsMoving(true);
    try {
      const transitionData: CreateDepartmentTransitionDto = {
        toDepartment,
        notes: notes || transitionNotes,
      };
      
      const updatedProject = await projectsApi.moveToDepartment(project.id, transitionData);
      toast.success(`Project moved to ${toDepartment} successfully!`);
      onUpdate?.(updatedProject);
      setShowTransitionModal(false);
      setTransitionNotes('');
    } catch (error: any) {
      const technicalMessage = error.response?.data?.message || 'Failed to move project to the selected department. Please try again.';
      setErrorAlert({
        title: 'Cannot Change Project Stage',
        message: standardizeErrorMessage(technicalMessage),
        suggestion: getErrorSuggestion(technicalMessage)
      });
    } finally {
      setIsMoving(false);
    }
  };

  const openTransitionModal = (department: Department) => {
    setSelectedDepartment(department);
    setShowTransitionModal(true);
  };

  return (
    <>
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Department Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Department Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm text-gray-600">Currently in</p>
              <Badge className={departmentColors[project.currentDepartment]}>
                {project.currentDepartment.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          {project.nextDepartment && (
            <div className="flex items-center gap-2 text-gray-600">
              <ArrowRight className="h-4 w-4" />
              <div>
                <p className="text-sm">Next</p>
                <Badge variant="outline">
                  {project.nextDepartment.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Department Checklist Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {project.currentDepartment} Department Checklist
                </p>
                <p className="text-xs text-blue-700">
                  Complete all required items before moving to next department
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-blue-900">
                Ready to proceed
              </span>
            </div>
          </div>
        </div>

        {/* Department Progress Bar */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Progress</p>
          <div className="flex items-center gap-1">
            {departmentOrder.map((dept, index) => {
              const isCurrent = dept === project.currentDepartment;
              const isPassed = index < currentIndex;
              
              return (
                <div key={dept} className="flex items-center flex-1">
                  <div
                    className={`h-2 rounded-full flex-1 transition-colors ${
                      isPassed
                        ? 'bg-green-500'
                        : isCurrent
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }`}
                  />
                  {index < departmentOrder.length - 1 && (
                    <ArrowRight className="h-3 w-3 mx-1 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        {canManageDepartments && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Quick Actions</p>
            <div className="flex gap-2 flex-wrap">
              {suggestedNext && (
                <Button
                  size="sm"
                  onClick={() => handleMoveToDepartment(suggestedNext, `Auto-moved to next department: ${suggestedNext}`)}
                  disabled={isMoving}
                  className="flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" />
                  Move to {suggestedNext.replace('_', ' ')}
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => openTransitionModal(Department.QA)}
                disabled={isMoving || project.currentDepartment === Department.QA}
              >
                Send to QA
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => openTransitionModal(Department.DELIVERY)}
                disabled={isMoving || project.currentDepartment === Department.DELIVERY}
              >
                Ready for Delivery
              </Button>
            </div>
          </div>
        )}

        {/* Custom Department Move */}
        {canManageDepartments && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Move to Specific Department</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {departmentOrder.map(dept => (
                <Button
                  key={dept}
                  size="sm"
                  variant={dept === project.currentDepartment ? "default" : "outline"}
                  disabled={dept === project.currentDepartment || isMoving}
                  onClick={() => openTransitionModal(dept)}
                  className="text-xs"
                >
                  {dept.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Transition Modal */}
        {showTransitionModal && selectedDepartment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
              <h3 className="text-lg font-semibold mb-4">
                Move to {selectedDepartment.replace('_', ' ')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Transition Notes (Optional)
                  </label>
                  <textarea
                    value={transitionNotes}
                    onChange={(e) => setTransitionNotes(e.target.value)}
                    placeholder="Add notes about this transition..."
                    className="w-full mt-1 p-2 border rounded-md resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTransitionModal(false);
                      setTransitionNotes('');
                    }}
                    disabled={isMoving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleMoveToDepartment(selectedDepartment)}
                    disabled={isMoving}
                  >
                    {isMoving ? 'Moving...' : 'Move Project'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department History Summary */}
        {project.departmentHistory && project.departmentHistory.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <History className="h-4 w-4" />
              <p className="text-sm font-medium">Recent Transitions</p>
            </div>
            <div className="space-y-2">
              {project.departmentHistory.slice(0, 3).map((transition) => (
                <div key={transition.id} className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    {transition.fromDepartment && (
                      <>
                        <span>{transition.fromDepartment}</span>
                        <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                    <span className="font-medium">{transition.toDepartment}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(transition.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    
    {errorAlert && (
      <AlertDialog
        isOpen={!!errorAlert}
        onClose={() => setErrorAlert(null)}
        title={errorAlert.title}
        message={errorAlert.message}
        suggestion={errorAlert.suggestion}
        type="error"
      />
    )}
    </>
  );
}