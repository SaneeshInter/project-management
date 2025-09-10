import { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  ArrowRight, 
  AlertTriangle, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Activity,
  FileText,
  Target,
  Paperclip,
  CheckSquare,
  FolderOpen,
  Download,
  BarChart3,
  CheckCircle2,
  XCircle,
  Link,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project, ProjectDepartmentHistory, Department, DepartmentWorkStatus, DepartmentChecklistProgress } from '@/types';
import { projectsApi, departmentsApi } from '@/lib/api';

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateShort = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

interface ProjectTimelineTabProps {
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
  currentChecklistStatus?: DepartmentChecklistProgress;
  estimatedVsActual?: {
    estimatedDays?: number;
    actualDays?: number;
    variance?: number;
  };
  extractedTransitionData?: {
    ktNotes?: string;
    ktDocuments?: string[];
    expectedStart?: string;
    expectedEnd?: string;
    estimatedHours?: number;
    assignedTo?: string;
  };
  estimatedCompletionDate?: string;
  isCurrentDepartment?: boolean;
  isDuplicate?: boolean;
}

const departmentColors: Record<Department, string> = {
  [Department.PMO]: 'bg-blue-500 text-white',
  [Department.DESIGN]: 'bg-purple-500 text-white',
  [Department.HTML]: 'bg-orange-500 text-white',
  [Department.PHP]: 'bg-indigo-500 text-white',
  [Department.REACT]: 'bg-cyan-500 text-white',
  [Department.WORDPRESS]: 'bg-green-500 text-white',
  [Department.QA]: 'bg-yellow-500 text-white',
  [Department.DELIVERY]: 'bg-emerald-500 text-white',
  [Department.MANAGER]: 'bg-red-500 text-white',
  [Department.SALES_EXE]: 'bg-pink-500 text-white',
};

const departmentLightColors: Record<Department, string> = {
  [Department.PMO]: 'bg-blue-50 text-blue-700 border-blue-200',
  [Department.DESIGN]: 'bg-purple-50 text-purple-700 border-purple-200',
  [Department.HTML]: 'bg-orange-50 text-orange-700 border-orange-200',
  [Department.PHP]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [Department.REACT]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  [Department.WORDPRESS]: 'bg-green-50 text-green-700 border-green-200',
  [Department.QA]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  [Department.DELIVERY]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [Department.MANAGER]: 'bg-red-50 text-red-700 border-red-200',
  [Department.SALES_EXE]: 'bg-pink-50 text-pink-700 border-pink-200',
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

export default function ProjectTimelineTab({ project }: ProjectTimelineTabProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [checklistData, setChecklistData] = useState<Record<string, DepartmentChecklistProgress>>({});
  const [mainDepartments, setMainDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch enhanced data on component mount
  useEffect(() => {
    const fetchEnhancedData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch main departments
        const departments = await departmentsApi.getMainDepartments();
        setMainDepartments(departments);
        
        // Fetch checklist data for all departments that the project has been through
        const departmentSet = new Set([project.currentDepartment]);
        if (project.departmentHistory) {
          project.departmentHistory.forEach(history => {
            departmentSet.add(history.toDepartment);
            if (history.fromDepartment) {
              departmentSet.add(history.fromDepartment);
            }
          });
        }
        
        const checklistPromises = Array.from(departmentSet).map(async dept => {
          try {
            const progress = await projectsApi.getChecklistProgress(project.id, dept);
            return [dept, progress];
          } catch (error) {
            console.warn(`Could not fetch checklist for ${dept}:`, error);
            return [dept, null];
          }
        });
        
        const checklistResults = await Promise.all(checklistPromises);
        const checklistMap: Record<string, DepartmentChecklistProgress> = {};
        checklistResults.forEach(([dept, progress]) => {
          if (progress) {
            console.log(`Checklist data for ${dept}:`, {
              totalItems: progress.totalItems,
              completedItems: progress.completedItems,
              itemsArrayLength: progress.items?.length,
              items: progress.items
            });
            checklistMap[dept as string] = progress;
          }
        });
        
        setChecklistData(checklistMap);
      } catch (error) {
        console.error('Error fetching enhanced timeline data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnhancedData();
  }, [project.id, project.currentDepartment]);

  const processHistoryData = (): HistoryItemWithAnalytics[] => {
    if (!project.departmentHistory || project.departmentHistory.length === 0) {
      return [];
    }

    const sortedHistory = [...project.departmentHistory].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Remove duplicates based on department and creation time proximity
    const deduplicatedHistory = sortedHistory.filter((item, index) => {
      if (index === 0) return true;
      
      const prevItem = sortedHistory[index - 1];
      const timeDifference = new Date(item.createdAt).getTime() - new Date(prevItem.createdAt).getTime();
      const isDuplicateDepartment = item.toDepartment === prevItem.toDepartment;
      const isWithinMinutes = timeDifference < (5 * 60 * 1000); // 5 minutes
      
      // Mark as duplicate but don't filter out yet - we'll handle it in mapping
      if (isDuplicateDepartment && isWithinMinutes) {
        (item as any).isDuplicate = true;
        return false;
      }
      
      return true;
    });

    return deduplicatedHistory.map((item, index) => {
      const nextItem = deduplicatedHistory[index + 1];
      const startDate = new Date(item.createdAt);
      const endDate = nextItem ? new Date(nextItem.createdAt) : new Date();
      const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const isCurrentDepartment = item.toDepartment === project.currentDepartment && index === deduplicatedHistory.length - 1;

      // Enhanced checklist parsing with multiple format support
      let checklistCompletionAtTransition: HistoryItemWithAnalytics['checklistCompletionAtTransition'] = undefined;
      
      if (item.notes) {
        // Try advanced format first: "Checklist: X/Y items completed (Z/W required)"
        const advancedMatch = item.notes.match(/Checklist:\s*(\d+)\/(\d+)\s*items?\s*completed\s*\((\d+)\/(\d+)\s*required\)/);
        if (advancedMatch) {
          checklistCompletionAtTransition = {
            completed: parseInt(advancedMatch[1]),
            total: parseInt(advancedMatch[2]),
            completedRequired: parseInt(advancedMatch[3]),
            required: parseInt(advancedMatch[4]),
            canProceedToNext: parseInt(advancedMatch[3]) === parseInt(advancedMatch[4])
          };
        } else {
          // Try simpler format: "X/Y items completed" or "X/Y checklist items completed"
          const simpleMatch = item.notes.match(/(?:checklist\s+)?(\d+)\/(\d+)\s*(?:checklist\s+)?items?\s*completed/i);
          if (simpleMatch) {
            const completed = parseInt(simpleMatch[1]);
            const total = parseInt(simpleMatch[2]);
            checklistCompletionAtTransition = {
              completed,
              total,
              completedRequired: completed, // Assume all completed items were required
              required: total, // Assume all items are required
              canProceedToNext: completed === total
            };
          } else {
            // Try even simpler format: "X/Y completed"
            const basicMatch = item.notes.match(/(\d+)\/(\d+)\s+completed/i);
            if (basicMatch) {
              const completed = parseInt(basicMatch[1]);
              const total = parseInt(basicMatch[2]);
              checklistCompletionAtTransition = {
                completed,
                total,
                completedRequired: completed,
                required: total,
                canProceedToNext: completed === total
              };
            } else {
              // Try to extract any mention of checklist completion percentage
              const percentMatch = item.notes.match(/checklist.*?(\d+)%\s*completed?/i);
              if (percentMatch) {
                const percentage = parseInt(percentMatch[1]);
                const completed = Math.round(percentage / 10); // Estimate based on percentage
                const total = 10; // Assume 10 items as default
                checklistCompletionAtTransition = {
                  completed,
                  total,
                  completedRequired: completed,
                  required: total,
                  canProceedToNext: percentage >= 100
                };
              }
            }
          }
        }
      }

      // Extract detailed transition data from notes
      const extractedTransitionData = item.notes ? {
        ktNotes: item.notes.match(/KT Notes:\s*([^|]+)/)?.[1]?.trim(),
        ktDocuments: item.notes.match(/KT Documents:\s*([^|]+)/)?.[1]?.split(',')?.map(doc => doc.trim()),
        expectedStart: item.notes.match(/Expected Start:\s*([^|]+)/)?.[1]?.trim(),
        expectedEnd: item.notes.match(/Expected End:\s*([^|]+)/)?.[1]?.trim(),
        estimatedHours: item.notes.match(/Estimated Hours:\s*(\d+)/)?.[1] ? parseInt(item.notes.match(/Estimated Hours:\s*(\d+)/)?.[1] || '0') : undefined,
        assignedTo: item.notes.match(/Assigned To:\s*([^|]+)/)?.[1]?.trim()
      } : {};

      const estimatedVsActual = {
        estimatedDays: item.estimatedDays,
        actualDays: item.actualDays || (item.workStatus === DepartmentWorkStatus.COMPLETED ? durationInDays : undefined),
        variance: item.estimatedDays && item.actualDays ? 
          ((item.actualDays - item.estimatedDays) / item.estimatedDays) * 100 : undefined
      };

      // Get current checklist status for this department
      const currentChecklistStatus = checklistData[item.toDepartment];
      
      // Calculate estimated completion date for current department
      let estimatedCompletionDate: string | undefined;
      if (isCurrentDepartment && currentChecklistStatus) {
        const completionPercentage = currentChecklistStatus.completionPercentage;
        if (completionPercentage > 0 && completionPercentage < 100) {
          const remainingPercentage = 100 - completionPercentage;
          const averageDaysPerPercent = durationInDays / completionPercentage;
          const estimatedRemainingDays = Math.ceil(averageDaysPerPercent * remainingPercentage);
          const estimatedDate = new Date();
          estimatedDate.setDate(estimatedDate.getDate() + estimatedRemainingDays);
          estimatedCompletionDate = estimatedDate.toISOString();
        }
      }

      return {
        ...item,
        durationInDays,
        checklistCompletionAtTransition,
        currentChecklistStatus,
        estimatedVsActual,
        extractedTransitionData,
        estimatedCompletionDate,
        isCurrentDepartment,
        isDuplicate: false
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

  const getTimelineMetrics = () => {
    const totalDays = historyItems.reduce((sum, item) => sum + (item.durationInDays || 0), 0);
    const completedDepartments = historyItems.filter(item => 
      item.workStatus === DepartmentWorkStatus.COMPLETED
    ).length;
    const departmentsWithCorrections = historyItems.filter(item => 
      item.correctionCount > 0
    ).length;
    const averageDaysPerDept = historyItems.length > 0 ? Math.round(totalDays / historyItems.length) : 0;
    
    // Enhanced metrics
    const currentDepartmentItem = historyItems.find(item => item.isCurrentDepartment);
    const currentDepartmentProgress = currentDepartmentItem?.currentChecklistStatus?.completionPercentage || 0;
    
    // Calculate estimated remaining days for current department
    let estimatedRemainingDays = 0;
    if (currentDepartmentItem && currentDepartmentProgress > 0 && currentDepartmentProgress < 100) {
      const currentDays = currentDepartmentItem.durationInDays || 0;
      const remainingPercentage = 100 - currentDepartmentProgress;
      const daysPerPercent = currentDays / currentDepartmentProgress;
      estimatedRemainingDays = Math.ceil(daysPerPercent * remainingPercentage);
    }

    // Calculate total estimated project completion based on remaining departments
    const remainingDepartments = mainDepartments.length - completedDepartments - (currentDepartmentItem ? 1 : 0);
    const estimatedRemainingForProject = estimatedRemainingDays + (remainingDepartments * averageDaysPerDept);

    return {
      totalDays,
      completedDepartments,
      departmentsWithCorrections,
      averageDaysPerDept,
      totalDepartments: historyItems.length,
      currentDepartmentProgress: Math.round(currentDepartmentProgress),
      estimatedRemainingDays,
      estimatedRemainingForProject,
      totalEstimatedProjectDuration: totalDays + estimatedRemainingForProject
    };
  };

  const metrics = getTimelineMetrics();

  const getDepartmentAbbreviation = (dept: Department) => {
    const abbreviations = {
      [Department.PMO]: 'PMO',
      [Department.DESIGN]: 'DES',
      [Department.HTML]: 'HTML',
      [Department.PHP]: 'PHP',
      [Department.REACT]: 'RCT',
      [Department.WORDPRESS]: 'WP',
      [Department.QA]: 'QA',
      [Department.DELIVERY]: 'DEL',
      [Department.MANAGER]: 'MGR',
      [Department.SALES_EXE]: 'SALE'
    };
    return abbreviations[dept];
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-500 rounded-full mb-6"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Timeline Data</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Fetching department history and checklist progress...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (historyItems.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="w-16 h-16 mx-auto text-gray-300 mb-6" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Timeline Data Available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              The project timeline will appear here once the project begins moving through departments. 
              Each transition will be recorded with detailed notes and completion metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Timeline Metrics with Duration Tracking */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.completedDepartments}</p>
              <p className="text-xs text-gray-600">of {mainDepartments.length} Depts</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalDays}</p>
              <p className="text-xs text-gray-600">Days Elapsed</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.currentDepartmentProgress}%</p>
              <p className="text-xs text-gray-600">Current Dept Progress</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.estimatedRemainingDays > 0 ? metrics.estimatedRemainingDays : '--'}
              </p>
              <p className="text-xs text-gray-600">Est. Days Left</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.departmentsWithCorrections}</p>
              <p className="text-xs text-gray-600">Corrections</p>
            </div>
          </div>
        </Card>
      </div>


      {/* Enhanced Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Project Timeline & History
          </CardTitle>
          <p className="text-sm text-gray-600">
            Detailed department transition history with enhanced transition notes and analytics
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {historyItems.map((item, index) => {
              const isExpanded = expandedItems.has(item.id);
              const isLast = index === historyItems.length - 1;
              const isFirst = index === 0;
              const isCurrent = isLast && item.workStatus !== DepartmentWorkStatus.COMPLETED;

              return (
                <div key={item.id} className="relative">
                  {/* Timeline Connector */}
                  {!isLast && (
                    <div className="absolute left-6 top-20 w-0.5 h-20 bg-gradient-to-b from-gray-300 to-gray-200" />
                  )}

                  <div className="flex gap-6">
                    {/* Enhanced Timeline Dot */}
                    <div className="relative flex-shrink-0">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold shadow-lg
                        ${departmentColors[item.toDepartment]}
                        ${isCurrent ? 'ring-4 ring-blue-200 animate-pulse' : ''}
                      `}>
                        {getDepartmentAbbreviation(item.toDepartment)}
                      </div>
                      {isCurrent && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Enhanced Content Card */}
                    <div className="flex-1">
                      <Card className={`
                        border-l-4 transition-all duration-200
                        ${departmentLightColors[item.toDepartment].includes('blue') ? 'border-l-blue-500' :
                          departmentLightColors[item.toDepartment].includes('purple') ? 'border-l-purple-500' :
                          departmentLightColors[item.toDepartment].includes('orange') ? 'border-l-orange-500' :
                          departmentLightColors[item.toDepartment].includes('indigo') ? 'border-l-indigo-500' :
                          departmentLightColors[item.toDepartment].includes('cyan') ? 'border-l-cyan-500' :
                          departmentLightColors[item.toDepartment].includes('green') ? 'border-l-green-500' :
                          departmentLightColors[item.toDepartment].includes('yellow') ? 'border-l-yellow-500' :
                          departmentLightColors[item.toDepartment].includes('emerald') ? 'border-l-emerald-500' :
                          'border-l-red-500'
                        }
                        ${isCurrent ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''}
                      `}>
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {!isFirst && item.fromDepartment && (
                                  <>
                                    <Badge variant="outline" className="text-xs font-medium">
                                      From {item.fromDepartment.replace('_', ' ')}
                                    </Badge>
                                    <ArrowRight className="w-3 h-3 text-gray-400" />
                                  </>
                                )}
                                <Badge className={departmentLightColors[item.toDepartment] + ' font-medium'}>
                                  {item.toDepartment.replace('_', ' ')} Department
                                </Badge>
                                <Badge className={workStatusColors[item.workStatus]}>
                                  {item.workStatus.replace('_', ' ')}
                                </Badge>
                                {isCurrent && (
                                  <Badge className="bg-green-100 text-green-800 animate-pulse">
                                    Current
                                  </Badge>
                                )}
                              </div>

                              {/* Key Metrics Row */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{formatDateShort(new Date(item.createdAt))}</p>
                                    <p className="text-xs text-gray-600">Started</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{item.durationInDays} days</p>
                                    <p className="text-xs text-gray-600">Duration</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{item.movedBy.name}</p>
                                    <p className="text-xs text-gray-600">Moved By</p>
                                  </div>
                                </div>

                                {item.correctionCount > 0 && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                    <div>
                                      <p className="font-medium text-orange-700">{item.correctionCount}</p>
                                      <p className="text-xs text-gray-600">Corrections</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(item.id)}
                              className="ml-4"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </div>

                          {/* Enhanced Transition Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Enhanced Real-time Checklist Status */}
                            <div className="bg-blue-50 border-l-4 border-l-blue-500 p-4 rounded-r-lg">
                              <div className="flex items-start gap-2">
                                <CheckSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-blue-900">Checklist Status</p>
                                    {item.isCurrentDepartment && (
                                      <Badge className="bg-green-100 text-green-800 text-xs animate-pulse">
                                        Live
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Show current checklist status for current department or historical data */}
                                  {(item.isCurrentDepartment && item.currentChecklistStatus) ? (
                                    <div className="space-y-3">
                                      <div className="flex justify-between text-xs">
                                        <span>Total: {item.currentChecklistStatus.completedItems}/{item.currentChecklistStatus.totalItems}</span>
                                        <span className={`font-medium ${
                                          item.currentChecklistStatus.completionPercentage >= 100 ? 'text-green-600' : 
                                          item.currentChecklistStatus.completionPercentage >= 50 ? 'text-blue-600' : 'text-orange-600'
                                        }`}>
                                          {Math.round(item.currentChecklistStatus.completionPercentage)}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-blue-200 rounded-full h-3">
                                        <div 
                                          className={`h-3 rounded-full transition-all duration-500 ${
                                            item.currentChecklistStatus.completionPercentage >= 100 ? 'bg-green-500' :
                                            item.currentChecklistStatus.completionPercentage >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                                          }`}
                                          style={{ 
                                            width: `${Math.min(item.currentChecklistStatus.completionPercentage, 100)}%` 
                                          }}
                                        />
                                      </div>
                                      <div className="grid grid-cols-1 gap-2">
                                        <div className="flex justify-between text-xs text-blue-700">
                                          <span>Required: {item.currentChecklistStatus.completedRequiredItems}/{item.currentChecklistStatus.requiredItems}</span>
                                          <Badge className={`text-xs ${
                                            item.currentChecklistStatus.canProceedToNext
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-orange-100 text-orange-800'
                                          }`}>
                                            {item.currentChecklistStatus.canProceedToNext ? 'Ready to Proceed' : 'Requirements Pending'}
                                          </Badge>
                                        </div>
                                        {item.estimatedCompletionDate && (
                                          <div className="text-xs text-blue-600 italic">
                                            Estimated completion: {formatDateShort(new Date(item.estimatedCompletionDate))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : item.checklistCompletionAtTransition ? (
                                    // Historical checklist data
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-xs">
                                        <span>Completed: {item.checklistCompletionAtTransition.completed}/{item.checklistCompletionAtTransition.total}</span>
                                        <span className={`font-medium ${item.checklistCompletionAtTransition.canProceedToNext ? 'text-green-600' : 'text-orange-600'}`}>
                                          {Math.round((item.checklistCompletionAtTransition.completed / item.checklistCompletionAtTransition.total) * 100)}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full transition-all ${
                                            item.checklistCompletionAtTransition.canProceedToNext 
                                              ? 'bg-green-500' 
                                              : 'bg-orange-500'
                                          }`}
                                          style={{ 
                                            width: `${(item.checklistCompletionAtTransition.completed / item.checklistCompletionAtTransition.total) * 100}%` 
                                          }}
                                        />
                                      </div>
                                      <div className="text-xs text-blue-700">
                                        Required: {item.checklistCompletionAtTransition.completedRequired}/{item.checklistCompletionAtTransition.required}
                                        <Badge className={`ml-2 text-xs ${
                                          item.checklistCompletionAtTransition.canProceedToNext 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-orange-100 text-orange-800'
                                        }`}>
                                          {item.checklistCompletionAtTransition.canProceedToNext ? 'Met Requirements' : 'Incomplete'}
                                        </Badge>
                                      </div>
                                    </div>
                                  ) : (
                                    // Fallback status
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-blue-700">
                                          {item.workStatus === DepartmentWorkStatus.COMPLETED 
                                            ? "Department completed - checklist requirements met"
                                            : item.isCurrentDepartment 
                                              ? "Checklist data loading..." 
                                              : "Checklist completion data not recorded"
                                          }
                                        </span>
                                        <Badge className={`text-xs ${
                                          item.workStatus === DepartmentWorkStatus.COMPLETED 
                                            ? 'bg-green-100 text-green-800' 
                                            : item.isCurrentDepartment
                                              ? 'bg-blue-100 text-blue-600'
                                              : 'bg-gray-100 text-gray-600'
                                        }`}>
                                          {item.workStatus === DepartmentWorkStatus.COMPLETED 
                                            ? 'Completed' 
                                            : item.isCurrentDepartment
                                              ? 'In Progress'
                                              : 'Unknown'
                                          }
                                        </Badge>
                                      </div>
                                      {item.workStatus === DepartmentWorkStatus.COMPLETED && (
                                        <div className="w-full bg-blue-200 rounded-full h-2">
                                          <div className="h-2 rounded-full bg-green-500 w-full transition-all" />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Assigned To Information */}
                            {item.extractedTransitionData?.assignedTo && (
                              <div className="bg-purple-50 border-l-4 border-l-purple-500 p-4 rounded-r-lg">
                                <div className="flex items-start gap-2">
                                  <User className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-purple-900 mb-1">Assigned To</p>
                                    <p className="text-sm text-purple-700 font-medium">
                                      {item.extractedTransitionData.assignedTo}
                                    </p>
                                    {item.extractedTransitionData.estimatedHours && (
                                      <p className="text-xs text-purple-600 mt-1">
                                        Estimated: {item.extractedTransitionData.estimatedHours} hours
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Documents and KT Information */}
                          {(item.extractedTransitionData?.ktDocuments?.length || item.extractedTransitionData?.ktNotes) && (
                            <div className="bg-green-50 border-l-4 border-l-green-500 p-4 rounded-r-lg mb-4">
                              <div className="flex items-start gap-2">
                                <FolderOpen className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-green-900 mb-2">Knowledge Transfer & Documents</p>
                                  
                                  {item.extractedTransitionData.ktNotes && (
                                    <div className="mb-3">
                                      <p className="text-xs font-medium text-green-800 mb-1">KT Notes:</p>
                                      <p className="text-sm text-green-700 bg-white bg-opacity-60 p-2 rounded border">
                                        {item.extractedTransitionData.ktNotes}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {item.extractedTransitionData.ktDocuments && item.extractedTransitionData.ktDocuments.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-green-800 mb-2">KT Documents ({item.extractedTransitionData.ktDocuments.length}):</p>
                                      <div className="space-y-1">
                                        {item.extractedTransitionData.ktDocuments.map((doc, docIndex) => (
                                          <div key={docIndex} className="flex items-center gap-2 text-sm text-green-700 bg-white bg-opacity-60 p-2 rounded border">
                                            <Paperclip className="w-3 h-3 flex-shrink-0" />
                                            <span className="flex-1 truncate">{doc}</span>
                                            <Download className="w-3 h-3 text-green-600 cursor-pointer hover:text-green-800" />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Timeline Information */}
                          {(item.extractedTransitionData?.expectedStart || item.extractedTransitionData?.expectedEnd) && (
                            <div className="bg-yellow-50 border-l-4 border-l-yellow-500 p-4 rounded-r-lg mb-4">
                              <div className="flex items-start gap-2">
                                <Calendar className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-yellow-900 mb-2">Expected Timeline</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    {item.extractedTransitionData.expectedStart && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-yellow-700">Start:</span>
                                        <span className="font-medium text-yellow-900">{item.extractedTransitionData.expectedStart}</span>
                                      </div>
                                    )}
                                    {item.extractedTransitionData.expectedEnd && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-yellow-700">End:</span>
                                        <span className="font-medium text-yellow-900">{item.extractedTransitionData.expectedEnd}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Detailed Checklist Status - Always Visible */}
                          {(item.currentChecklistStatus || item.checklistCompletionAtTransition) && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="bg-white border rounded-lg p-4">
                                <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <CheckSquare className="w-4 h-4" />
                                  Detailed Checklist Status
                                </h5>
                                {item.currentChecklistStatus && item.currentChecklistStatus.items && (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                      <div className="text-center p-2 bg-blue-50 rounded">
                                        <p className="text-sm font-bold text-blue-600">{item.currentChecklistStatus.totalItems}</p>
                                        <p className="text-xs text-blue-700">Total Items</p>
                                      </div>
                                      <div className="text-center p-2 bg-green-50 rounded">
                                        <p className="text-sm font-bold text-green-600">{item.currentChecklistStatus.completedItems}</p>
                                        <p className="text-xs text-green-700">Completed</p>
                                      </div>
                                      <div className="text-center p-2 bg-purple-50 rounded">
                                        <p className="text-sm font-bold text-purple-600">{item.currentChecklistStatus.requiredItems}</p>
                                        <p className="text-xs text-purple-700">Required</p>
                                      </div>
                                      <div className="text-center p-2 bg-orange-50 rounded">
                                        <p className="text-sm font-bold text-orange-600">{item.currentChecklistStatus.totalItems - item.currentChecklistStatus.completedItems}</p>
                                        <p className="text-xs text-orange-700">Remaining</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="space-y-4 pt-4 border-t">

                              {/* Detailed Checklist Items - Only in Expanded View */}
                              {item.currentChecklistStatus && item.currentChecklistStatus.items && (
                                <div className="bg-white border rounded-lg p-4">
                                  <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4" />
                                    Checklist Items
                                  </h5>
                                  <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                      <h6 className="text-xs font-medium text-gray-700 mb-2">Checklist Items ({item.currentChecklistStatus.items.length} items):</h6>
                                      {item.currentChecklistStatus.items.length !== item.currentChecklistStatus.totalItems && (
                                        <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                          Showing {item.currentChecklistStatus.items.length} of {item.currentChecklistStatus.totalItems}
                                        </Badge>
                                      )}
                                    </div>
                                    {item.currentChecklistStatus.items.length > 0 ? (
                                      <>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                          {item.currentChecklistStatus.items.map((checklistItem, idx) => (
                                            <div key={checklistItem.id || idx} className="flex items-start gap-2 p-3 bg-white rounded text-sm border hover:bg-gray-50 transition-colors">
                                              <div className="flex-shrink-0 mt-0.5">
                                                {checklistItem.isCompleted ? (
                                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                ) : (
                                                  <XCircle className="w-4 h-4 text-gray-400" />
                                                )}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                  <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                      <span className={`${checklistItem.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'} text-sm font-medium`}>
                                                        {checklistItem.title}
                                                      </span>
                                                      {checklistItem.isRequired && (
                                                        <Badge className="text-xs bg-purple-100 text-purple-800">Required</Badge>
                                                      )}
                                                      {checklistItem.links && checklistItem.links.length > 0 && (
                                                        <Badge className="text-xs bg-blue-100 text-blue-800">
                                                          {checklistItem.links.length} file{checklistItem.links.length > 1 ? 's' : ''}
                                                        </Badge>
                                                      )}
                                                    </div>
                                                    {checklistItem.description && (
                                                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{checklistItem.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                      {checklistItem.completedAt && (
                                                        <span className="text-green-600 font-medium">
                                                          {formatDateShort(new Date(checklistItem.completedAt))}
                                                        </span>
                                                      )}
                                                      {checklistItem.completedBy && (
                                                        <span className="text-blue-600">
                                                          by {checklistItem.completedBy.name}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        {item.currentChecklistStatus.totalItems > item.currentChecklistStatus.items.length && (
                                          <div className="text-center py-2 text-yellow-600 bg-yellow-50 rounded border border-yellow-200">
                                            <p className="text-sm">⚠️ Only showing {item.currentChecklistStatus.items.length} of {item.currentChecklistStatus.totalItems} total items</p>
                                            <p className="text-xs">Some items may not be loaded or visible due to permissions or API limitations</p>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="text-center py-4 text-gray-500">
                                        <p className="text-sm">No checklist items available</p>
                                        <p className="text-xs">This might indicate the checklist is not set up for this department</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Work Timeline Details */}
                              <div className="bg-white border rounded-lg p-4">
                                <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Work Timeline Details
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Department Entry:</span>
                                    <span className="font-medium">{formatDate(new Date(item.createdAt))}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Work Started:</span>
                                    <span className="font-medium">
                                      {item.workStartDate 
                                        ? formatDate(new Date(item.workStartDate))
                                        : 'Not started'
                                      }
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Work Ended:</span>
                                    <span className="font-medium">
                                      {item.workEndDate 
                                        ? formatDate(new Date(item.workEndDate))
                                        : 'In progress'
                                      }
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Duration:</span>
                                    <span className="font-medium">{item.durationInDays} days</span>
                                  </div>
                                </div>
                              </div>

                              {/* Raw Transition Notes (if any additional info) */}
                              {item.notes && (
                                <div className="bg-gray-50 border rounded-lg p-4">
                                  <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Complete Transition Notes
                                  </h5>
                                  <div className="text-sm text-gray-700 bg-white p-3 rounded border leading-relaxed font-mono text-xs">
                                    {item.notes}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}