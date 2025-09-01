import { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  WorkflowApproval, 
  ApprovalStatus, 
  ApprovalType,
  ProjectDepartmentHistory 
} from '@/types';

interface ApprovalInterfaceProps {
  approval: WorkflowApproval;
  departmentHistory: ProjectDepartmentHistory;
  currentUserRole: string;
  onApprove: (approvalId: string, comments?: string) => void;
  onReject: (approvalId: string, rejectionReason: string, comments?: string) => void;
}

export default function ApprovalInterface({
  approval,
  departmentHistory,
  currentUserRole,
  onApprove,
  onReject
}: ApprovalInterfaceProps) {
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const canApprove = () => {
    if (approval.status !== ApprovalStatus.PENDING) return false;
    
    switch (approval.approvalType) {
      case ApprovalType.CLIENT_APPROVAL:
        return currentUserRole === 'CLIENT';
      case ApprovalType.QA_APPROVAL:
      case ApprovalType.BEFORE_LIVE_QA:
        return currentUserRole === 'ADMIN' || currentUserRole === 'PROJECT_MANAGER';
      default:
        return false;
    }
  };

  const getApprovalTitle = () => {
    switch (approval.approvalType) {
      case ApprovalType.CLIENT_APPROVAL:
        return `${departmentHistory.toDepartment} Design Approval Required`;
      case ApprovalType.QA_APPROVAL:
        return `${departmentHistory.toDepartment} QA Approval Required`;
      case ApprovalType.BEFORE_LIVE_QA:
        return 'Before Live QA Approval Required';
      default:
        return 'Approval Required';
    }
  };

  const getApprovalDescription = () => {
    switch (approval.approvalType) {
      case ApprovalType.CLIENT_APPROVAL:
        return 'Please review the design and provide your approval or feedback for any changes needed.';
      case ApprovalType.QA_APPROVAL:
        return 'QA testing has been completed. Please review the results and approve for next stage.';
      case ApprovalType.BEFORE_LIVE_QA:
        return 'Final pre-launch QA has been completed. Please approve for live deployment.';
      default:
        return 'Please review and provide your approval.';
    }
  };

  const handleApprove = () => {
    onApprove(approval.id, comments);
    setComments('');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onReject(approval.id, rejectionReason, comments);
    setRejectionReason('');
    setComments('');
    setShowRejectionForm(false);
  };

  if (approval.status !== ApprovalStatus.PENDING) {
    return (
      <Card className="border-l-4 border-l-gray-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            {approval.status === ApprovalStatus.APPROVED ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            {getApprovalTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Badge 
              variant={approval.status === ApprovalStatus.APPROVED ? 'default' : 'destructive'}
            >
              {approval.status}
            </Badge>
            {approval.reviewedBy && (
              <p className="text-sm text-muted-foreground">
                {approval.status === ApprovalStatus.APPROVED ? 'Approved' : 'Rejected'} by {approval.reviewedBy.name}
              </p>
            )}
            {approval.comments && (
              <p className="text-sm">{approval.comments}</p>
            )}
            {approval.rejectionReason && (
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">
                  <strong>Rejection Reason:</strong> {approval.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-orange-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-orange-500" />
          {getApprovalTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{getApprovalDescription()}</p>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Comments (Optional)</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments or feedback..."
              className="w-full p-2 border rounded-md text-sm min-h-[80px]"
            />
          </div>

          {canApprove() ? (
            <div className="flex gap-2">
              <Button onClick={handleApprove} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setShowRejectionForm(!showRejectionForm)}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                Only {approval.approvalType === ApprovalType.CLIENT_APPROVAL ? 'clients' : 'managers'} can approve this request.
              </p>
            </div>
          )}

          {showRejectionForm && (
            <div className="space-y-2 p-3 bg-red-50 border border-red-200 rounded">
              <label className="text-sm font-medium text-red-800">Rejection Reason (Required)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why you're rejecting this..."
                className="w-full p-2 border rounded-md text-sm min-h-[60px]"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleReject}>
                  Submit Rejection
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowRejectionForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}