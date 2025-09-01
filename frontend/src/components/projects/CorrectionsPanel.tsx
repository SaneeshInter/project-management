import { useState, useEffect } from 'react';
import { AlertTriangle, User, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DepartmentCorrection, 
  CorrectionStatus, 
  Priority,
  CreateCorrectionDto,
  UpdateCorrectionDto,
  ProjectDepartmentHistory 
} from '@/types';
import { projectsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface CorrectionsPanelProps {
  projectId: string;
  departmentHistory: ProjectDepartmentHistory[];
  onUpdate?: () => void;
  canManageCorrections?: boolean;
}

const correctionStatusColors: Record<CorrectionStatus, string> = {
  [CorrectionStatus.OPEN]: 'bg-red-100 text-red-800',
  [CorrectionStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [CorrectionStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [CorrectionStatus.REJECTED]: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<Priority, string> = {
  [Priority.LOW]: 'bg-gray-100 text-gray-800',
  [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [Priority.HIGH]: 'bg-orange-100 text-orange-800',
  [Priority.URGENT]: 'bg-red-100 text-red-800',
};

export default function CorrectionsPanel({ 
  projectId, 
  departmentHistory, 
  onUpdate,
  canManageCorrections = false 
}: CorrectionsPanelProps) {
  const [corrections, setCorrections] = useState<DepartmentCorrection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');
  const [newCorrection, setNewCorrection] = useState<Partial<CreateCorrectionDto>>({
    correctionType: '',
    description: '',
    priority: Priority.MEDIUM,
  });

  useEffect(() => {
    loadCorrections();
  }, [projectId]);

  const loadCorrections = async () => {
    setIsLoading(true);
    try {
      const data = await projectsApi.getProjectCorrections(projectId);
      setCorrections(data);
    } catch (error) {
      toast.error('Failed to load corrections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCorrection = async () => {
    if (!selectedHistoryId || !newCorrection.correctionType || !newCorrection.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await projectsApi.createCorrection(projectId, selectedHistoryId, newCorrection as CreateCorrectionDto);
      toast.success('Correction created successfully!');
      setShowCreateModal(false);
      setNewCorrection({
        correctionType: '',
        description: '',
        priority: Priority.MEDIUM,
      });
      setSelectedHistoryId('');
      loadCorrections();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create correction');
    }
  };

  const handleUpdateCorrection = async (correctionId: string, updateData: UpdateCorrectionDto) => {
    try {
      await projectsApi.updateCorrection(projectId, correctionId, updateData);
      toast.success('Correction updated successfully!');
      loadCorrections();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update correction');
    }
  };

  const getStatusIcon = (status: CorrectionStatus) => {
    switch (status) {
      case CorrectionStatus.OPEN:
        return <AlertTriangle className="h-4 w-4" />;
      case CorrectionStatus.IN_PROGRESS:
        return <Clock className="h-4 w-4" />;
      case CorrectionStatus.RESOLVED:
        return <CheckCircle className="h-4 w-4" />;
      case CorrectionStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const groupedCorrections = corrections.reduce((groups, correction) => {
    const dept = correction.departmentHistory?.toDepartment || 'Unknown Department';
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push(correction);
    return groups;
  }, {} as Record<string, DepartmentCorrection[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Corrections & Issues ({corrections.length})
          </CardTitle>
          {canManageCorrections && departmentHistory.length > 0 && (
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Correction
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 animate-spin text-gray-400" />
            <p className="text-gray-500">Loading corrections...</p>
          </div>
        ) : corrections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
            <p>No corrections needed - great work!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedCorrections).map(([department, deptCorrections]) => (
              <div key={department}>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Badge variant="outline">{department.replace('_', ' ')}</Badge>
                  <span className="text-sm text-gray-500">
                    ({deptCorrections.length} correction{deptCorrections.length !== 1 ? 's' : ''})
                  </span>
                </h4>
                
                <div className="space-y-3">
                  {deptCorrections.map(correction => (
                    <div key={correction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getStatusIcon(correction.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{correction.correctionType}</h5>
                              <Badge className={priorityColors[correction.priority]} variant="outline">
                                {correction.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{correction.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>Requested by {correction.requestedBy.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(correction.requestedAt).toLocaleDateString()}</span>
                              </div>
                              {correction.assignedTo && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>Assigned to {correction.assignedTo.name}</span>
                                </div>
                              )}
                            </div>

                            {/* Time tracking */}
                            {(correction.estimatedHours || correction.actualHours) && (
                              <div className="flex gap-4 text-xs mt-2">
                                {correction.estimatedHours && (
                                  <span className="text-blue-600">Est: {correction.estimatedHours}h</span>
                                )}
                                {correction.actualHours && (
                                  <span className={
                                    correction.estimatedHours && correction.actualHours > correction.estimatedHours
                                      ? 'text-red-600 font-medium'
                                      : 'text-green-600 font-medium'
                                  }>
                                    Actual: {correction.actualHours}h
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Resolution info */}
                            {correction.status === CorrectionStatus.RESOLVED && correction.resolutionNotes && (
                              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
                                <p className="text-green-800">
                                  <strong>Resolution:</strong> {correction.resolutionNotes}
                                </p>
                                {correction.resolvedAt && (
                                  <p className="text-xs text-green-600 mt-1">
                                    Resolved on {new Date(correction.resolvedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Badge className={correctionStatusColors[correction.status]} variant="outline">
                          {correction.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Action buttons */}
                      {canManageCorrections && correction.status !== CorrectionStatus.RESOLVED && (
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          {correction.status === CorrectionStatus.OPEN && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateCorrection(correction.id, { status: CorrectionStatus.IN_PROGRESS })}
                            >
                              Start Work
                            </Button>
                          )}
                          
                          {correction.status === CorrectionStatus.IN_PROGRESS && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const resolutionNotes = prompt('Resolution notes:');
                                if (resolutionNotes) {
                                  handleUpdateCorrection(correction.id, { 
                                    status: CorrectionStatus.RESOLVED,
                                    resolutionNotes 
                                  });
                                }
                              }}
                            >
                              Mark Resolved
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateCorrection(correction.id, { status: CorrectionStatus.REJECTED })}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Correction Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] max-w-90vw">
              <h3 className="text-lg font-semibold mb-4">Create Correction Request</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Department *</label>
                  <select
                    value={selectedHistoryId}
                    onChange={(e) => setSelectedHistoryId(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                    required
                  >
                    <option value="">Select department...</option>
                    {departmentHistory
                      .filter(history => 
                        history.toDepartment !== 'DELIVERY' && 
                        history.toDepartment !== 'QA' && 
                        history.toDepartment !== 'PMO'
                      )
                      .map(history => (
                        <option key={history.id} value={history.id}>
                          {history.toDepartment.replace('_', ' ')} 
                          {history.workStatus !== 'COMPLETED' && ' (Current)'}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Correction Type *</label>
                  <Input
                    value={newCorrection.correctionType || ''}
                    onChange={(e) => setNewCorrection(prev => ({ ...prev, correctionType: e.target.value }))}
                    placeholder="e.g., Design Revision, Code Review, Content Update"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    value={newCorrection.description || ''}
                    onChange={(e) => setNewCorrection(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what needs to be corrected..."
                    className="w-full mt-1 p-2 border rounded-md resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select
                      value={newCorrection.priority || Priority.MEDIUM}
                      onChange={(e) => setNewCorrection(prev => ({ ...prev, priority: e.target.value as Priority }))}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      {Object.values(Priority).map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Estimated Hours</label>
                    <Input
                      type="number"
                      value={newCorrection.estimatedHours || ''}
                      onChange={(e) => setNewCorrection(prev => ({ 
                        ...prev, 
                        estimatedHours: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      placeholder="Hours"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewCorrection({
                        correctionType: '',
                        description: '',
                        priority: Priority.MEDIUM,
                      });
                      setSelectedHistoryId('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCorrection}>
                    Create Correction
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