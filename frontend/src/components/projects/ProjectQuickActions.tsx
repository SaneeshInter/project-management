import { useState } from 'react';
import { 
  ArrowRight, Edit, Eye, 
  Clock, MessageSquare,
  CheckCircle, Pause, Play, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Project, 
  Department, 
  ProjectStatus,
  CreateDepartmentTransitionDto 
} from '@/types';
import AlertDialog from '@/components/ui/alert-dialog';
import { standardizeErrorMessage, getErrorSuggestion } from '@/lib/errorMessages';

interface ProjectQuickActionsProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onMoveProject?: (projectId: string, data: CreateDepartmentTransitionDto) => Promise<void>;
  onUpdateStatus?: (projectId: string, status: ProjectStatus) => void;
  onQuickEdit?: (project: Project) => void;
}

interface QuickMoveModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onMove: (data: CreateDepartmentTransitionDto) => Promise<void>;
}

interface QuickStatusUpdateProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (status: ProjectStatus) => void;
}

const departmentOrder: Department[] = [
  Department.PMO,
  Department.DESIGN,
  Department.HTML,
  Department.PHP,
  Department.REACT,
  Department.WORDPRESS,
  Department.QA,
  Department.DELIVERY
];

function QuickMoveModal({ project, isOpen, onClose, onMove }: QuickMoveModalProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | ''>('');
  const [estimatedDays, setEstimatedDays] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [errorAlert, setErrorAlert] = useState<{ title: string; message: string; suggestion?: string } | null>(null);
  
  const currentIndex = departmentOrder.indexOf(project.currentDepartment);
  const availableDepartments = departmentOrder.slice(currentIndex + 1);
  
  const handleMove = async () => {
    if (!selectedDepartment) return;
    
    setIsMoving(true);
    try {
      await onMove({
        toDepartment: selectedDepartment as Department,
        estimatedDays: estimatedDays || undefined,
        notes: notes || undefined
      });
      
      setSelectedDepartment('');
      setEstimatedDays('');
      setNotes('');
      onClose();
    } catch (error: any) {
      const technicalMessage = error.message || 'Failed to move project to the selected department. Please try again.';
      setErrorAlert({
        title: 'Cannot Change Project Stage',
        message: standardizeErrorMessage(technicalMessage),
        suggestion: getErrorSuggestion(technicalMessage)
      });
    } finally {
      setIsMoving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Move Project
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Moving "{project.name}" from {project.currentDepartment.replace('_', ' ')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">To Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value as Department)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Select department...</option>
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>
                  {dept.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Estimated Days (Optional)</label>
            <Input
              type="number"
              placeholder="Enter estimated days"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value ? parseInt(e.target.value) : '')}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
            <Input
              placeholder="Add any notes about this transition"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleMove} 
              disabled={!selectedDepartment || isMoving}
              className="flex-1"
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              {isMoving ? 'Moving...' : 'Move Project'}
            </Button>
          </div>
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
    </div>
  );
}

function QuickStatusUpdate({ project, isOpen, onClose, onUpdate }: QuickStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(project.status);
  
  const handleUpdate = () => {
    onUpdate(selectedStatus);
    onClose();
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: ProjectStatus.ACTIVE, label: 'Active', icon: <Play className="h-4 w-4" />, color: 'text-green-600' },
    { value: ProjectStatus.HOLD, label: 'On Hold', icon: <Pause className="h-4 w-4" />, color: 'text-yellow-600' },
    { value: ProjectStatus.COMPLETED, label: 'Completed', icon: <CheckCircle className="h-4 w-4" />, color: 'text-blue-600' },
    { value: ProjectStatus.CANCELLED, label: 'Cancelled', icon: <X className="h-4 w-4" />, color: 'text-red-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Update Project Status
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Change status for "{project.name}"
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {statusOptions.map(option => (
              <div
                key={option.value}
                className={`
                  p-3 border rounded-lg cursor-pointer transition-all
                  ${selectedStatus === option.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setSelectedStatus(option.value)}
              >
                <div className="flex items-center gap-3">
                  <div className={option.color}>
                    {option.icon}
                  </div>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.value === project.status && (
                      <div className="text-xs text-muted-foreground">Current status</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={selectedStatus === project.status}
              className="flex-1"
            >
              Update Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProjectQuickActions({
  project,
  isOpen,
  onClose,
  onMoveProject,
  onUpdateStatus,
  onQuickEdit
}: ProjectQuickActionsProps) {
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const quickActions = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      color: 'text-blue-600',
      action: () => {
        window.location.href = `/projects/${project.id}`;
        onClose();
      }
    },
    {
      id: 'edit',
      label: 'Quick Edit',
      icon: <Edit className="h-4 w-4" />,
      color: 'text-green-600',
      action: () => {
        onQuickEdit?.(project);
        onClose();
      }
    },
    {
      id: 'move',
      label: 'Move Department',
      icon: <ArrowRight className="h-4 w-4" />,
      color: 'text-purple-600',
      disabled: project.status !== 'ACTIVE',
      action: () => setShowMoveModal(true)
    },
    {
      id: 'status',
      label: 'Update Status',
      icon: <Clock className="h-4 w-4" />,
      color: 'text-orange-600',
      action: () => setShowStatusModal(true)
    },
    {
      id: 'comment',
      label: 'Add Comment',
      icon: <MessageSquare className="h-4 w-4" />,
      color: 'text-indigo-600',
      action: () => {
        window.location.href = `/projects/${project.id}#comments`;
        onClose();
      }
    }
  ];

  const handleMove = async (data: CreateDepartmentTransitionDto) => {
    if (onMoveProject) {
      await onMoveProject(project.id, data);
    }
    setShowMoveModal(false);
  };

  const handleStatusUpdate = (status: ProjectStatus) => {
    onUpdateStatus?.(project.id, status);
    setShowStatusModal(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Quick Actions
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {project.name}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{project.projectCode}</Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  {project.currentDepartment.replace('_', ' ')}
                </Badge>
                <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickActions.map(action => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="w-full justify-start h-12"
                  onClick={action.action}
                  disabled={action.disabled}
                >
                  <div className={`mr-3 ${action.color}`}>
                    {action.icon}
                  </div>
                  <span>{action.label}</span>
                  {action.disabled && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Unavailable
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Target Date:</span>
                  <span>{new Date(project.targetDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Owner:</span>
                  <span>{project.owner.name}</span>
                </div>
                {project.clientName && (
                  <div className="flex justify-between">
                    <span>Client:</span>
                    <span>{project.clientName}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <QuickMoveModal
        project={project}
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onMove={handleMove}
      />

      <QuickStatusUpdate
        project={project}
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onUpdate={handleStatusUpdate}
      />
    </>
  );
}