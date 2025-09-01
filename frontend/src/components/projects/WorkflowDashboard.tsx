import { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Bug, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Project, 
  ProjectDepartmentHistory,
  DepartmentWorkStatus,
  ApprovalStatus,
  QAStatus,
  BugSeverity,
  ApprovalType,
  QAType 
} from '@/types';

interface WorkflowDashboardProps {
  project: Project;
  departmentHistory: ProjectDepartmentHistory[];
  onRequestApproval?: (historyId: string, approvalType: ApprovalType) => void;
  onSubmitApproval?: (approvalId: string, status: ApprovalStatus, comments?: string) => void;
  onStartQA?: (historyId: string, qaType: QAType, testerId: string) => void;
  onCompleteQA?: (qaRoundId: string, status: QAStatus, bugsFound: number, criticalBugs: number) => void;
}

const workflowStatusConfig = {
  [DepartmentWorkStatus.NOT_STARTED]: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' },
  [DepartmentWorkStatus.IN_PROGRESS]: { icon: Play, color: 'text-blue-500', bg: 'bg-blue-100' },
  [DepartmentWorkStatus.PENDING_CLIENT_APPROVAL]: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
  [DepartmentWorkStatus.CLIENT_REJECTED]: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
  [DepartmentWorkStatus.QA_TESTING]: { icon: Bug, color: 'text-purple-500', bg: 'bg-purple-100' },
  [DepartmentWorkStatus.QA_REJECTED]: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
  [DepartmentWorkStatus.BUGFIX_IN_PROGRESS]: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  [DepartmentWorkStatus.BEFORE_LIVE_QA]: { icon: Bug, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  [DepartmentWorkStatus.READY_FOR_DELIVERY]: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
  [DepartmentWorkStatus.COMPLETED]: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
  [DepartmentWorkStatus.CORRECTIONS_NEEDED]: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  [DepartmentWorkStatus.ON_HOLD]: { icon: Pause, color: 'text-gray-500', bg: 'bg-gray-100' },
};

export default function WorkflowDashboard({ 
  project, 
  departmentHistory,
  onRequestApproval,
  onSubmitApproval,
  onStartQA,
  onCompleteQA 
}: WorkflowDashboardProps) {
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  const formatWorkflowStatus = (status: DepartmentWorkStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSeverityColor = (severity: BugSeverity) => {
    switch (severity) {
      case BugSeverity.CRITICAL: return 'text-red-600 bg-red-100';
      case BugSeverity.HIGH: return 'text-orange-600 bg-orange-100';
      case BugSeverity.MEDIUM: return 'text-yellow-600 bg-yellow-100';
      case BugSeverity.LOW: return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📋</span>
            Workflow Status: {project.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{departmentHistory?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Stages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {departmentHistory?.filter(h => h.workStatus === DepartmentWorkStatus.COMPLETED).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {departmentHistory?.filter(h => 
                  h.workStatus === DepartmentWorkStatus.PENDING_CLIENT_APPROVAL || 
                  h.workStatus === DepartmentWorkStatus.QA_TESTING
                ).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department History with Workflow Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Department Workflow Timeline</h3>
        {departmentHistory?.map((history) => {
          const StatusIcon = workflowStatusConfig[history.workStatus]?.icon || Clock;
          const isExpanded = expandedHistory === history.id;
          
          return (
            <Card key={history.id} className="border-l-4 border-l-blue-500">
              <CardHeader 
                className="cursor-pointer" 
                onClick={() => setExpandedHistory(isExpanded ? null : history.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${workflowStatusConfig[history.workStatus]?.bg || 'bg-gray-100'}`}>
                      <StatusIcon className={`h-4 w-4 ${workflowStatusConfig[history.workStatus]?.color || 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{history.toDepartment} Department</h4>
                      <p className="text-sm text-muted-foreground">{formatWorkflowStatus(history.workStatus)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formatWorkflowStatus(history.workStatus)}</Badge>
                    {(history.approvals?.length || 0) > 0 && (
                      <Badge variant="secondary">{history.approvals!.length} Approvals</Badge>
                    )}
                    {(history.qaRounds?.length || 0) > 0 && (
                      <Badge variant="secondary">{history.qaRounds!.length} QA Rounds</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="space-y-4">
                  {/* Workflow Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {history.workStatus === DepartmentWorkStatus.COMPLETED && 
                     history.toDepartment === 'DESIGN' && (
                      <Button 
                        size="sm" 
                        onClick={() => onRequestApproval?.(history.id, ApprovalType.CLIENT_APPROVAL)}
                      >
                        Request Client Approval
                      </Button>
                    )}
                    
                    {history.workStatus === DepartmentWorkStatus.COMPLETED && 
                     history.toDepartment === 'HTML' && (
                      <Button 
                        size="sm" 
                        onClick={() => onStartQA?.(history.id, QAType.HTML_QA, 'qa-user-id')}
                      >
                        Start HTML QA
                      </Button>
                    )}
                    
                    {history.workStatus === DepartmentWorkStatus.COMPLETED && 
                     (history.toDepartment === 'REACT' || history.toDepartment === 'PHP') && (
                      <Button 
                        size="sm" 
                        onClick={() => onStartQA?.(history.id, QAType.DEV_QA, 'qa-user-id')}
                      >
                        Start DEV QA
                      </Button>
                    )}
                  </div>

                  {/* Approvals Section */}
                  {history.approvals && history.approvals.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Approvals</h5>
                      {history.approvals.map((approval) => (
                        <div key={approval.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{approval.approvalType.replace('_', ' ')}</div>
                              <div className="text-xs text-muted-foreground">
                                Requested by {approval.requestedBy.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={approval.status === ApprovalStatus.APPROVED ? 'default' : 
                                        approval.status === ApprovalStatus.REJECTED ? 'destructive' : 'secondary'}
                              >
                                {approval.status}
                              </Badge>
                              {approval.status === ApprovalStatus.PENDING && (
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    onClick={() => onSubmitApproval?.(approval.id, ApprovalStatus.APPROVED)}
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => onSubmitApproval?.(approval.id, ApprovalStatus.REJECTED)}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          {approval.comments && (
                            <p className="text-xs text-muted-foreground mt-2">{approval.comments}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* QA Rounds Section */}
                  {history.qaRounds && history.qaRounds.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">QA Testing Rounds</h5>
                      {history.qaRounds.map((qaRound) => (
                        <div key={qaRound.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">Round {qaRound.roundNumber} - {qaRound.qaType.replace('_', ' ')}</div>
                              <div className="text-xs text-muted-foreground">
                                Tested by {qaRound.testedBy.name}
                              </div>
                            </div>
                            <Badge 
                              variant={qaRound.status === QAStatus.PASSED ? 'default' : 
                                      qaRound.status === QAStatus.FAILED ? 'destructive' : 'secondary'}
                            >
                              {qaRound.status}
                            </Badge>
                          </div>
                          
                          {qaRound.bugsFound > 0 && (
                            <div className="mt-2 flex gap-4 text-xs">
                              <span>🐛 {qaRound.bugsFound} bugs found</span>
                              {qaRound.criticalBugs > 0 && (
                                <span className="text-red-600">🚨 {qaRound.criticalBugs} critical</span>
                              )}
                            </div>
                          )}

                          {/* QA Bugs */}
                          {qaRound.bugs && qaRound.bugs.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <h6 className="text-xs font-medium">Bugs Found:</h6>
                              {qaRound.bugs.map((bug) => (
                                <div key={bug.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                                  <div>
                                    <span className="font-medium">{bug.title}</span>
                                    <Badge className={`ml-2 text-xs ${getSeverityColor(bug.severity)}`}>
                                      {bug.severity}
                                    </Badge>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {bug.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {qaRound.status === QAStatus.IN_PROGRESS && (
                            <div className="mt-2 flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => onCompleteQA?.(qaRound.id, QAStatus.PASSED, 0, 0)}
                              >
                                Mark as Passed
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => onCompleteQA?.(qaRound.id, QAStatus.FAILED, 1, 0)}
                              >
                                Mark as Failed
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}