import { useState } from 'react';
import { Play, Pause, CheckCircle, AlertTriangle, Clock, XCircle, Bug } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Project, 
  ProjectDepartmentHistory, 
  DepartmentWorkStatus,
  UpdateDepartmentWorkStatusDto 
} from '@/types';
import { projectsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface DepartmentWorkTrackerProps {
  project: Project;
  currentHistory?: ProjectDepartmentHistory;
  onUpdate?: () => void;
  canManageWork?: boolean;
}

const statusActions = {
  [DepartmentWorkStatus.NOT_STARTED]: {
    icon: Play,
    label: 'Start Work',
    color: 'bg-blue-600 hover:bg-blue-700',
    nextStatus: DepartmentWorkStatus.IN_PROGRESS,
  },
  [DepartmentWorkStatus.IN_PROGRESS]: {
    icon: CheckCircle,
    label: 'Mark Complete',
    color: 'bg-green-600 hover:bg-green-700',
    nextStatus: DepartmentWorkStatus.COMPLETED,
  },
  [DepartmentWorkStatus.CORRECTIONS_NEEDED]: {
    icon: Play,
    label: 'Resume Work',
    color: 'bg-blue-600 hover:bg-blue-700',
    nextStatus: DepartmentWorkStatus.IN_PROGRESS,
  },
  [DepartmentWorkStatus.COMPLETED]: {
    icon: CheckCircle,
    label: 'Completed',
    color: 'bg-gray-400',
    nextStatus: null,
  },
  [DepartmentWorkStatus.ON_HOLD]: {
    icon: Play,
    label: 'Resume Work',
    color: 'bg-blue-600 hover:bg-blue-700',
    nextStatus: DepartmentWorkStatus.IN_PROGRESS,
  },
  [DepartmentWorkStatus.PENDING_CLIENT_APPROVAL]: {
    icon: Clock,
    label: 'Awaiting Client',
    color: 'bg-orange-400',
    nextStatus: null,
  },
  [DepartmentWorkStatus.CLIENT_REJECTED]: {
    icon: XCircle,
    label: 'Client Rejected',
    color: 'bg-red-600 hover:bg-red-700',
    nextStatus: DepartmentWorkStatus.IN_PROGRESS,
  },
  [DepartmentWorkStatus.QA_TESTING]: {
    icon: Bug,
    label: 'QA Testing',
    color: 'bg-purple-400',
    nextStatus: null,
  },
  [DepartmentWorkStatus.QA_REJECTED]: {
    icon: XCircle,
    label: 'QA Rejected',
    color: 'bg-red-600 hover:bg-red-700',
    nextStatus: DepartmentWorkStatus.BUGFIX_IN_PROGRESS,
  },
  [DepartmentWorkStatus.BUGFIX_IN_PROGRESS]: {
    icon: AlertTriangle,
    label: 'Fixing Bugs',
    color: 'bg-yellow-600 hover:bg-yellow-700',
    nextStatus: DepartmentWorkStatus.QA_TESTING,
  },
  [DepartmentWorkStatus.BEFORE_LIVE_QA]: {
    icon: Bug,
    label: 'Pre-Live QA',
    color: 'bg-indigo-600 hover:bg-indigo-700',
    nextStatus: DepartmentWorkStatus.READY_FOR_DELIVERY,
  },
  [DepartmentWorkStatus.READY_FOR_DELIVERY]: {
    icon: CheckCircle,
    label: 'Ready for Delivery',
    color: 'bg-green-400',
    nextStatus: null,
  },
};

export default function DepartmentWorkTracker({ 
  project, 
  currentHistory, 
  onUpdate,
  canManageWork = false
}: DepartmentWorkTrackerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [notes, setNotes] = useState('');

  const currentStatus = currentHistory?.workStatus || DepartmentWorkStatus.NOT_STARTED;
  const action = statusActions[currentStatus];

  const handleStatusUpdate = async (newStatus: DepartmentWorkStatus, includeTimestamp = true) => {
    if (!canManageWork || !action.nextStatus) return;
    
    setIsUpdating(true);
    try {
      const updateData: UpdateDepartmentWorkStatusDto = {
        workStatus: newStatus,
        notes: notes || undefined,
      };

      // Add timestamps based on status
      if (newStatus === DepartmentWorkStatus.IN_PROGRESS && includeTimestamp) {
        updateData.workStartDate = new Date().toISOString();
      } else if (newStatus === DepartmentWorkStatus.COMPLETED && includeTimestamp) {
        updateData.workEndDate = new Date().toISOString();
        // Calculate actual days from work start date
        if (currentHistory?.workStartDate) {
          const startDate = new Date(currentHistory.workStartDate);
          const endDate = new Date();
          updateData.actualDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        }
      }

      await projectsApi.updateDepartmentWorkStatus(project.id, updateData);
      toast.success(`Work status updated to ${newStatus.replace('_', ' ').toLowerCase()}!`);
      onUpdate?.();
      setShowStatusModal(false);
      setNotes('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update work status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getWorkDuration = () => {
    if (!currentHistory?.workStartDate) return null;
    
    const startDate = new Date(currentHistory.workStartDate);
    const endDate = currentHistory.workEndDate 
      ? new Date(currentHistory.workEndDate) 
      : new Date();
    
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getEfficiencyIndicator = () => {
    if (!currentHistory?.estimatedDays || !currentHistory?.actualDays) return null;
    
    const efficiency = (currentHistory.estimatedDays / currentHistory.actualDays) * 100;
    const isOnTrack = efficiency >= 80;
    
    return (
      <div className={`flex items-center gap-1 text-sm ${isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
        {isOnTrack ? (
          <CheckCircle className="h-3 w-3" />
        ) : (
          <AlertTriangle className="h-3 w-3" />
        )}
        <span>{Math.round(efficiency)}% efficiency</span>
      </div>
    );
  };

  if (!canManageWork) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Department Work Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge className={`${
              currentStatus === DepartmentWorkStatus.COMPLETED ? 'bg-green-100 text-green-800' :
              currentStatus === DepartmentWorkStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
              currentStatus === DepartmentWorkStatus.CORRECTIONS_NEEDED ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            } text-lg px-4 py-2`}>
              {currentStatus.replace('_', ' ')}
            </Badge>
            {getWorkDuration() && (
              <p className="text-sm text-gray-600 mt-2">
                Duration: {getWorkDuration()} days
              </p>
            )}
            {getEfficiencyIndicator()}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Work Tracker - {project.currentDepartment.replace('_', ' ')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current status display */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <action.icon className="h-5 w-5" />
            <div>
              <p className="font-medium">{currentStatus.replace('_', ' ')}</p>
              {getWorkDuration() && (
                <p className="text-sm text-gray-600">
                  Duration: {getWorkDuration()} days
                  {currentHistory?.estimatedDays && (
                    <span className="ml-2">
                      (Est: {currentHistory.estimatedDays} days)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          {getEfficiencyIndicator()}
        </div>

        {/* Work timeline info */}
        {(currentHistory?.workStartDate || currentHistory?.workEndDate) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {currentHistory.workStartDate && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-gray-600">Started:</p>
                  <p className="font-medium">
                    {new Date(currentHistory.workStartDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            {currentHistory.workEndDate && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-gray-600">Completed:</p>
                  <p className="font-medium">
                    {new Date(currentHistory.workEndDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {action.nextStatus && (
            <Button
              onClick={() => setShowStatusModal(true)}
              disabled={isUpdating}
              className={action.color}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          )}

          {currentStatus === DepartmentWorkStatus.IN_PROGRESS && (
            <Button
              onClick={() => handleStatusUpdate(DepartmentWorkStatus.ON_HOLD, false)}
              disabled={isUpdating}
              variant="outline"
            >
              <Pause className="h-4 w-4 mr-2" />
              Put On Hold
            </Button>
          )}

          <Button
            onClick={() => handleStatusUpdate(DepartmentWorkStatus.CORRECTIONS_NEEDED, false)}
            disabled={isUpdating}
            variant="outline"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Request Correction
          </Button>
        </div>

        {/* Status update modal */}
        {showStatusModal && action.nextStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
              <h3 className="text-lg font-semibold mb-4">
                {action.label}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this status update..."
                    className="w-full mt-1 p-2 border rounded-md resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowStatusModal(false);
                      setNotes('');
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(action.nextStatus!)}
                    disabled={isUpdating}
                    className={action.color}
                  >
                    {isUpdating ? 'Updating...' : action.label}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}