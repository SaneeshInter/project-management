import { useState } from 'react';
import { 
  Play, Pause, CheckCircle, X, Archive, EyeOff, Eye 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { Project, ProjectStatus } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ProjectStatusManagerProps {
  project: Project;
  onProjectUpdated: (project: Project) => void;
  userRole?: string;
}

const statusConfig = {
  ACTIVE: { icon: Play, label: 'Active', color: 'bg-green-100 text-green-800' },
  HOLD: { icon: Pause, label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { icon: CheckCircle, label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  CANCELLED: { icon: X, label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ARCHIVED: { icon: Archive, label: 'Archived', color: 'bg-gray-100 text-gray-800' },
} as const;

export default function ProjectStatusManager({
  project,
  onProjectUpdated,
  userRole
}: ProjectStatusManagerProps) {
  const [loading, setLoading] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [disableReason, setDisableReason] = useState('');

  const canManageStatus = userRole === 'ADMIN' || userRole === 'SU_ADMIN';
  const canDisable = userRole === 'ADMIN' || userRole === 'SU_ADMIN';

  // Debug logging (remove in production)
  console.log('ProjectStatusManager Debug:', {
    userRole,
    canManageStatus,
    canDisable,
    projectId: project.id,
    projectStatus: project.status
  });

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    
    setLoading(true);
    try {
      const response = await api.patch(`/projects/${project.id}/status`, {
        status: selectedStatus,
        reason: statusReason || `Status changed to ${selectedStatus}`
      });
      
      onProjectUpdated(response.data);
      setStatusReason('');
      setSelectedStatus(null);
      setShowStatusDialog(false);
      toast.success(`Project status updated to ${selectedStatus}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update project status');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableToggle = async () => {
    const disabled = !project.disabled;
    setLoading(true);
    try {
      const response = await api.patch(`/projects/${project.id}/disable`, {
        disabled,
        reason: disableReason || (disabled ? 'Project disabled' : 'Project enabled')
      });
      
      onProjectUpdated(response.data);
      setDisableReason('');
      setShowDisableDialog(false);
      toast.success(disabled ? 'Project disabled' : 'Project enabled');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const openStatusDialog = (status: ProjectStatus) => {
    setSelectedStatus(status);
    setShowStatusDialog(true);
  };

  if (!canManageStatus && !canDisable) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Current Status Display */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          <Badge className={statusConfig[project.status as keyof typeof statusConfig]?.color}>
            {(() => {
              const StatusIcon = statusConfig[project.status as keyof typeof statusConfig]?.icon;
              return StatusIcon ? <StatusIcon className="h-3 w-3 mr-1" /> : null;
            })()}
            {statusConfig[project.status as keyof typeof statusConfig]?.label || project.status}
          </Badge>
          {project.disabled && (
            <Badge variant="destructive" className="text-xs">
              <EyeOff className="h-3 w-3 mr-1" />
              DISABLED
            </Badge>
          )}
        </div>

        {/* Status Management Menu */}
        {canManageStatus && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">Change to:</span>
            {Object.entries(statusConfig).map(([status, config]) => {
              const IconComponent = config.icon;
              const isCurrentStatus = project.status === status;
              
              if (isCurrentStatus) return null;
              
              return (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => openStatusDialog(status as ProjectStatus)}
                  className="justify-start"
                  title={`Change status to ${config.label}`}
                >
                  <IconComponent className="h-3 w-3 mr-1" />
                  {config.label}
                </Button>
              );
            })}
          </div>
        )}

        {/* Disable/Enable Toggle */}
        {canDisable && (
          <Button 
            variant={project.disabled ? "default" : "destructive"} 
            size="sm"
            onClick={() => setShowDisableDialog(true)}
            disabled={loading}
          >
            {project.disabled ? (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Enable
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Disable
              </>
            )}
          </Button>
        )}
      </div>

      {/* Status Change Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showStatusDialog}
        onClose={() => {
          setShowStatusDialog(false);
          setSelectedStatus(null);
          setStatusReason('');
        }}
        onConfirm={handleStatusUpdate}
        title="Change Project Status"
        message={`Are you sure you want to change "${project.name}" status to ${selectedStatus ? statusConfig[selectedStatus]?.label : ''}?`}
        confirmText="Change Status"
        type="warning"
      />

      {/* Disable/Enable Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDisableDialog}
        onClose={() => {
          setShowDisableDialog(false);
          setDisableReason('');
        }}
        onConfirm={handleDisableToggle}
        title={project.disabled ? 'Enable Project' : 'Disable Project'}
        message={project.disabled 
          ? `Are you sure you want to enable "${project.name}"? This will make it visible in project lists.`
          : `Are you sure you want to disable "${project.name}"? This will hide it from project lists but preserve all data.`
        }
        confirmText={project.disabled ? 'Enable Project' : 'Disable Project'}
        type={project.disabled ? 'warning' : 'danger'}
      />
    </>
  );
}