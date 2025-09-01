import { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertTriangle, CheckCircle, XCircle, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ProjectDepartmentHistory, 
  DepartmentWorkStatus, 
  CorrectionStatus,
  DepartmentCorrection,
  ProjectTimelineAnalytics
} from '@/types';
import { projectsApi } from '@/lib/api';

interface ProjectTimelineViewProps {
  projectId: string;
  departmentHistory: ProjectDepartmentHistory[];
}

const workStatusColors: Record<DepartmentWorkStatus, string> = {
  [DepartmentWorkStatus.NOT_STARTED]: 'bg-gray-100 text-gray-800',
  [DepartmentWorkStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [DepartmentWorkStatus.CORRECTIONS_NEEDED]: 'bg-red-100 text-red-800',
  [DepartmentWorkStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [DepartmentWorkStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
  [DepartmentWorkStatus.PENDING_CLIENT_APPROVAL]: 'bg-orange-100 text-orange-800',
  [DepartmentWorkStatus.CLIENT_REJECTED]: 'bg-red-100 text-red-800',
  [DepartmentWorkStatus.QA_TESTING]: 'bg-purple-100 text-purple-800',
  [DepartmentWorkStatus.QA_REJECTED]: 'bg-red-100 text-red-800',
  [DepartmentWorkStatus.BUGFIX_IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [DepartmentWorkStatus.BEFORE_LIVE_QA]: 'bg-indigo-100 text-indigo-800',
  [DepartmentWorkStatus.READY_FOR_DELIVERY]: 'bg-green-100 text-green-800',
};

const correctionStatusColors: Record<CorrectionStatus, string> = {
  [CorrectionStatus.OPEN]: 'bg-red-100 text-red-800',
  [CorrectionStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [CorrectionStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [CorrectionStatus.REJECTED]: 'bg-gray-100 text-gray-800',
};

export default function ProjectTimelineView({ 
  projectId, 
  departmentHistory
}: ProjectTimelineViewProps) {
  const [analytics, setAnalytics] = useState<ProjectTimelineAnalytics | null>(null);
  const [corrections, setCorrections] = useState<DepartmentCorrection[]>([]);
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAnalytics();
    loadCorrections();
  }, [projectId]);

  const loadAnalytics = async () => {
    try {
      const data = await projectsApi.getTimelineAnalytics(projectId);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadCorrections = async () => {
    try {
      const data = await projectsApi.getProjectCorrections(projectId);
      setCorrections(data);
    } catch (error) {
      console.error('Failed to load corrections:', error);
    }
  };

  const toggleDepartmentExpansion = (historyId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(historyId)) {
      newExpanded.delete(historyId);
    } else {
      newExpanded.add(historyId);
    }
    setExpandedDepartments(newExpanded);
  };

  const formatDuration = (days?: number) => {
    if (!days) return 'N/A';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  const getEfficiencyColor = (estimated?: number, actual?: number) => {
    if (!estimated || !actual) return 'text-gray-500';
    const efficiency = (estimated / actual) * 100;
    if (efficiency >= 100) return 'text-green-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDepartmentCorrections = (historyId: string) => {
    return corrections.filter(c => c.historyId === historyId);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Project Timeline Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{analytics.totalDuration}</p>
                <p className="text-sm text-gray-600">Total Days</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{analytics.totalCorrections}</p>
                <p className="text-sm text-gray-600">Total Corrections</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{analytics.estimateAccuracy}%</p>
                <p className="text-sm text-gray-600">Estimate Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{analytics.averageResolutionTime}h</p>
                <p className="text-sm text-gray-600">Avg Resolution Time</p>
              </div>
            </div>
            
            {analytics.bottlenecks.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="font-medium text-red-800">Bottlenecks Detected</p>
                </div>
                <div className="flex gap-2">
                  {analytics.bottlenecks.map(dept => (
                    <Badge key={dept} variant="destructive">{dept}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Department Timeline History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentHistory.map((history, index) => {
              const isExpanded = expandedDepartments.has(history.id);
              const departmentCorrections = getDepartmentCorrections(history.id);
              const isLast = index === departmentHistory.length - 1;
              
              return (
                <div key={history.id} className="relative">
                  {/* Timeline connector */}
                  {!isLast && (
                    <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200"></div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* Timeline dot */}
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-4 bg-white z-10
                      ${history.workStatus === DepartmentWorkStatus.COMPLETED ? 'border-green-500' :
                        history.workStatus === DepartmentWorkStatus.IN_PROGRESS ? 'border-blue-500' :
                        history.workStatus === DepartmentWorkStatus.CORRECTIONS_NEEDED ? 'border-red-500' :
                        history.workStatus === DepartmentWorkStatus.ON_HOLD ? 'border-yellow-500' :
                        'border-gray-300'}
                    `}>
                      {history.workStatus === DepartmentWorkStatus.COMPLETED && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                      {history.workStatus === DepartmentWorkStatus.CORRECTIONS_NEEDED && (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                      {history.workStatus === DepartmentWorkStatus.IN_PROGRESS && (
                        <Play className="h-6 w-6 text-blue-500" />
                      )}
                      {history.workStatus === DepartmentWorkStatus.ON_HOLD && (
                        <Pause className="h-6 w-6 text-yellow-500" />
                      )}
                      {history.workStatus === DepartmentWorkStatus.NOT_STARTED && (
                        <Clock className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Department details */}
                    <div className="flex-1">
                      <div 
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleDepartmentExpansion(history.id)}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">
                              {history.fromDepartment && `${history.fromDepartment} → `}
                              {history.toDepartment.replace('_', ' ')}
                            </h3>
                            <Badge className={workStatusColors[history.workStatus]}>
                              {history.workStatus.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(history.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Summary stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Estimated</p>
                            <p className="font-medium">{formatDuration(history.estimatedDays)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Actual</p>
                            <p className={`font-medium ${getEfficiencyColor(history.estimatedDays, history.actualDays)}`}>
                              {formatDuration(history.actualDays)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Corrections</p>
                            <p className="font-medium flex items-center gap-1">
                              {history.correctionCount}
                              {history.correctionCount > 0 && (
                                <AlertTriangle className="h-3 w-3 text-orange-500" />
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Moved By</p>
                            <p className="font-medium text-sm">{history.movedBy.name}</p>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t pt-4 mt-4 space-y-4">
                            {/* Work timeline */}
                            {(history.workStartDate || history.workEndDate) && (
                              <div className="bg-blue-50 rounded-lg p-3">
                                <h4 className="font-medium mb-2">Work Timeline</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  {history.workStartDate && (
                                    <div>
                                      <p className="text-gray-600">Started:</p>
                                      <p className="font-medium">
                                        {new Date(history.workStartDate).toLocaleDateString()} at{' '}
                                        {new Date(history.workStartDate).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  )}
                                  {history.workEndDate && (
                                    <div>
                                      <p className="text-gray-600">Completed:</p>
                                      <p className="font-medium">
                                        {new Date(history.workEndDate).toLocaleDateString()} at{' '}
                                        {new Date(history.workEndDate).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Permission info */}
                            {history.permissionGrantedBy && (
                              <div className="bg-green-50 rounded-lg p-3">
                                <h4 className="font-medium mb-2">Authorization</h4>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-green-600" />
                                  <span className="text-sm">
                                    Permission granted by <strong>{history.permissionGrantedBy.name}</strong>
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Corrections details */}
                            {departmentCorrections.length > 0 && (
                              <div className="bg-red-50 rounded-lg p-3">
                                <h4 className="font-medium mb-3">Corrections ({departmentCorrections.length})</h4>
                                <div className="space-y-3">
                                  {departmentCorrections.map(correction => (
                                    <div key={correction.id} className="bg-white border rounded-lg p-3">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <p className="font-medium text-sm">{correction.correctionType}</p>
                                          <p className="text-xs text-gray-600">
                                            Requested by {correction.requestedBy.name} on{' '}
                                            {new Date(correction.requestedAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <Badge className={correctionStatusColors[correction.status]} variant="outline">
                                          {correction.status}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-700 mb-2">{correction.description}</p>
                                      
                                      {correction.assignedTo && (
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                          <User className="h-3 w-3" />
                                          <span>Assigned to {correction.assignedTo.name}</span>
                                        </div>
                                      )}

                                      {(correction.estimatedHours || correction.actualHours) && (
                                        <div className="flex gap-4 text-xs text-gray-600 mt-2">
                                          {correction.estimatedHours && (
                                            <span>Est: {correction.estimatedHours}h</span>
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

                                      {correction.resolutionNotes && (
                                        <div className="mt-2 p-2 bg-green-50 rounded text-sm">
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
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            {history.notes && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <h4 className="font-medium mb-2">Notes</h4>
                                <p className="text-sm text-gray-700">{history.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {departmentHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No department history available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {analytics && analytics.departmentBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Department Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.departmentBreakdown.map(dept => (
                <div key={dept.department} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{dept.department.replace('_', ' ')}</Badge>
                    <div className="text-sm">
                      <p className="font-medium">
                        {formatDuration(dept.actualDays)} 
                        {dept.estimatedDays && (
                          <span className="text-gray-500">
                            {' '}(est: {formatDuration(dept.estimatedDays)})
                          </span>
                        )}
                      </p>
                      {dept.correctionCount > 0 && (
                        <p className="text-red-600">
                          {dept.correctionCount} correction{dept.correctionCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm">
                    {dept.efficiency > 0 && (
                      <p className={`font-medium ${getEfficiencyColor(dept.estimatedDays, dept.actualDays)}`}>
                        {dept.efficiency}% efficiency
                      </p>
                    )}
                    <Badge className={workStatusColors[dept.status]} variant="outline">
                      {dept.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}