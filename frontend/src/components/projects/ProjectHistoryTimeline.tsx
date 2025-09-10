import { useState } from 'react';
import { 
  Clock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project, ProjectDepartmentHistory, Department, DepartmentWorkStatus } from '@/types';
// Using built-in Date methods since date-fns might not be available
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

interface ProjectHistoryTimelineProps {
  project: Project;
}

interface HistoryItemWithAnalytics extends ProjectDepartmentHistory {
  durationInDays?: number;
  checklistCompletionAtTransition?: {
    completed: number;
    total: number;
    required: number;
    completedRequired: number;
    canProceedToNext: boolean;
  };
  estimatedVsActual?: {
    estimatedDays?: number;
    actualDays?: number;
    variance?: number;
  };
}

const departmentColors: Record<Department, string> = {
  [Department.PMO]: 'bg-blue-100 text-blue-800 border-blue-200',
  [Department.DESIGN]: 'bg-purple-100 text-purple-800 border-purple-200',
  [Department.HTML]: 'bg-orange-100 text-orange-800 border-orange-200',
  [Department.PHP]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [Department.REACT]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  [Department.WORDPRESS]: 'bg-green-100 text-green-800 border-green-200',
  [Department.QA]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [Department.DELIVERY]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [Department.MANAGER]: 'bg-red-100 text-red-800 border-red-200',
  [Department.SALES_EXE]: 'bg-pink-100 text-pink-800 border-pink-200',
};

const workStatusColors: Record<DepartmentWorkStatus, string> = {
  [DepartmentWorkStatus.NOT_STARTED]: 'bg-gray-100 text-gray-700',
  [DepartmentWorkStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
  [DepartmentWorkStatus.CORRECTIONS_NEEDED]: 'bg-orange-100 text-orange-700',
  [DepartmentWorkStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [DepartmentWorkStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-700',
  [DepartmentWorkStatus.PENDING_CLIENT_APPROVAL]: 'bg-purple-100 text-purple-700',
  [DepartmentWorkStatus.CLIENT_REJECTED]: 'bg-red-100 text-red-700',
  [DepartmentWorkStatus.QA_TESTING]: 'bg-indigo-100 text-indigo-700',
  [DepartmentWorkStatus.QA_REJECTED]: 'bg-red-100 text-red-700',
  [DepartmentWorkStatus.BUGFIX_IN_PROGRESS]: 'bg-orange-100 text-orange-700',
  [DepartmentWorkStatus.BEFORE_LIVE_QA]: 'bg-cyan-100 text-cyan-700',
  [DepartmentWorkStatus.READY_FOR_DELIVERY]: 'bg-emerald-100 text-emerald-700',
};

export default function ProjectHistoryTimeline({ project }: ProjectHistoryTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Process history data and add analytics
  const processHistoryData = (): HistoryItemWithAnalytics[] => {
    if (!project.departmentHistory || project.departmentHistory.length === 0) {
      return [];
    }

    const sortedHistory = [...project.departmentHistory].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return sortedHistory.map((item, index) => {
      const nextItem = sortedHistory[index + 1];
      const startDate = new Date(item.createdAt);
      const endDate = nextItem ? new Date(nextItem.createdAt) : new Date();
      const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Extract checklist info from notes if available (since we're storing it there temporarily)
      const checklistMatch = item.notes?.match(/(\d+)\/(\d+) checklist items? completed/);
      const checklistCompletionAtTransition = checklistMatch ? {
        completed: parseInt(checklistMatch[1]),
        total: parseInt(checklistMatch[2]),
        required: parseInt(checklistMatch[2]), // Assuming all are required for now
        completedRequired: parseInt(checklistMatch[1]),
        canProceedToNext: parseInt(checklistMatch[1]) === parseInt(checklistMatch[2])
      } : undefined;

      const estimatedVsActual = {
        estimatedDays: item.estimatedDays,
        actualDays: item.actualDays || (item.workStatus === DepartmentWorkStatus.COMPLETED ? durationInDays : undefined),
        variance: item.estimatedDays && item.actualDays ? 
          ((item.actualDays - item.estimatedDays) / item.estimatedDays) * 100 : undefined
      };

      return {
        ...item,
        durationInDays,
        checklistCompletionAtTransition,
        estimatedVsActual
      };
    });
  };

  const historyItems = processHistoryData();

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getChecklistStatusBadge = (completion?: HistoryItemWithAnalytics['checklistCompletionAtTransition']) => {
    if (!completion) {
      return (
        <Badge variant="outline" className="text-gray-600">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Status Unknown
        </Badge>
      );
    }

    const isComplete = completion.canProceedToNext;
    return (
      <Badge 
        variant={isComplete ? "default" : "destructive"}
        className={isComplete ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
      >
        {isComplete ? (
          <CheckCircle2 className="w-3 h-3 mr-1" />
        ) : (
          <AlertTriangle className="w-3 h-3 mr-1" />
        )}
        {completion.completed}/{completion.total} Items
      </Badge>
    );
  };

  if (historyItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No department history available yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            History will appear here once the project moves between departments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Project Timeline & History
        </CardTitle>
        <p className="text-sm text-gray-600">
          Complete department transition history with checklist completion status
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeline Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {historyItems.length}
              </div>
              <div className="text-sm text-gray-600">Departments Visited</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {historyItems.reduce((sum, item) => sum + (item.durationInDays || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {historyItems.filter(item => item.correctionCount > 0).length}
              </div>
              <div className="text-sm text-gray-600">Departments with Corrections</div>
            </div>
          </div>

          {/* Timeline Items */}
          <div className="space-y-6">
            {historyItems.map((item, index) => {
              const isExpanded = expandedItems.has(item.id);
              const isLast = index === historyItems.length - 1;
              const isFirst = index === 0;

              return (
                <div key={item.id} className="relative">
                  {/* Timeline Line */}
                  {!isLast && (
                    <div className="absolute left-8 top-16 w-0.5 h-16 bg-gray-200" />
                  )}

                  {/* Timeline Item */}
                  <div className="flex gap-4">
                    {/* Timeline Dot */}
                    <div className={`
                      w-16 h-16 rounded-full border-4 flex items-center justify-center text-sm font-medium
                      ${departmentColors[item.toDepartment]}
                    `}>
                      {item.toDepartment === Department.PMO ? 'PMO' :
                       item.toDepartment === Department.DESIGN ? 'DES' :
                       item.toDepartment === Department.HTML ? 'HTML' :
                       item.toDepartment === Department.PHP ? 'PHP' :
                       item.toDepartment === Department.REACT ? 'REACT' :
                       item.toDepartment === Department.WORDPRESS ? 'WP' :
                       item.toDepartment === Department.QA ? 'QA' :
                       item.toDepartment === Department.DELIVERY ? 'DEL' :
                       'MGR'}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="bg-white border rounded-lg p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {!isFirst && item.fromDepartment && (
                                <>
                                  <Badge variant="outline" className="text-xs">
                                    {item.fromDepartment.replace('_', ' ')}
                                  </Badge>
                                  <ArrowRight className="w-3 h-3 text-gray-400" />
                                </>
                              )}
                              <Badge className={departmentColors[item.toDepartment]}>
                                {item.toDepartment.replace('_', ' ')} Department
                              </Badge>
                              <Badge className={workStatusColors[item.workStatus]}>
                                {item.workStatus.replace('_', ' ')}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(new Date(item.createdAt))}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {item.durationInDays} days
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {item.movedBy.name}
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(item.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </div>

                        {/* Checklist Status */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Checklist Completion:</span>
                              {getChecklistStatusBadge(item.checklistCompletionAtTransition)}
                            </div>
                            {item.correctionCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {item.correctionCount} Corrections
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            {/* Estimated vs Actual */}
                            {item.estimatedVsActual && (
                              <div>
                                <h5 className="text-sm font-medium mb-2">Time Analysis</h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Estimated:</span>
                                    <span className="ml-2 font-medium">
                                      {item.estimatedVsActual.estimatedDays || 'N/A'} days
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Actual:</span>
                                    <span className="ml-2 font-medium">
                                      {item.estimatedVsActual.actualDays || item.durationInDays} days
                                    </span>
                                  </div>
                                  {item.estimatedVsActual.variance !== undefined && (
                                    <div className="col-span-2">
                                      <span className="text-gray-600">Variance:</span>
                                      <span className={`ml-2 font-medium ${
                                        item.estimatedVsActual.variance > 0 ? 'text-red-600' : 'text-green-600'
                                      }`}>
                                        {item.estimatedVsActual.variance > 0 ? '+' : ''}
                                        {Math.round(item.estimatedVsActual.variance)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Checklist Details */}
                            {item.checklistCompletionAtTransition && (
                              <div>
                                <h5 className="text-sm font-medium mb-2">Checklist Status at Transition</h5>
                                <div className="bg-gray-50 p-3 rounded">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Total Items: {item.checklistCompletionAtTransition.total}</div>
                                    <div>Completed: {item.checklistCompletionAtTransition.completed}</div>
                                    <div>Required: {item.checklistCompletionAtTransition.required}</div>
                                    <div>Required Completed: {item.checklistCompletionAtTransition.completedRequired}</div>
                                  </div>
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${
                                          item.checklistCompletionAtTransition.canProceedToNext 
                                            ? 'bg-green-500' 
                                            : 'bg-orange-500'
                                        }`}
                                        style={{ 
                                          width: `${(item.checklistCompletionAtTransition.completed / item.checklistCompletionAtTransition.total) * 100}%` 
                                        }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {Math.round((item.checklistCompletionAtTransition.completed / item.checklistCompletionAtTransition.total) * 100)}% completed
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            {item.notes && (
                              <div>
                                <h5 className="text-sm font-medium mb-2">Transition Notes</h5>
                                <div className="bg-gray-50 p-3 rounded text-sm">
                                  {item.notes}
                                </div>
                              </div>
                            )}

                            {/* Work Dates */}
                            <div>
                              <h5 className="text-sm font-medium mb-2">Work Timeline</h5>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Started:</span>
                                  <span className="ml-2">
                                    {item.workStartDate 
                                      ? formatDate(new Date(item.workStartDate))
                                      : 'Not started'
                                    }
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Ended:</span>
                                  <span className="ml-2">
                                    {item.workEndDate 
                                      ? formatDate(new Date(item.workEndDate))
                                      : 'In progress'
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}