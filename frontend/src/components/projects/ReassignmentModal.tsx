import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Role, User, ProjectAssignmentHistory, ReassignPCDto, usersApi, projectsApi } from '@/types';

const reassignSchema = z.object({
  assignmentType: z.enum(['PROJECT_COORDINATOR', 'PC_TEAM_LEAD']),
  newUserId: z.string().min(1, 'Please select a user'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

interface ReassignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentPC?: User;
  currentPCTL?: User;
  onReassignSuccess: () => void;
}

export default function ReassignmentModal({ 
  isOpen, 
  onClose, 
  projectId, 
  currentPC, 
  currentPCTL, 
  onReassignSuccess 
}: ReassignmentModalProps) {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState<ProjectAssignmentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ReassignPCDto>({
    resolver: zodResolver(reassignSchema),
  });

  const selectedAssignmentType = watch('assignmentType');

  // Fetch users and assignment history
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoadingUsers(true);
      setLoadingHistory(true);
      
      try {
        // Fetch PMO users with PC and PC_TL roles
        const pmoUsers = await usersApi.getPMOCoordinators();
        setUsers(pmoUsers);

        // Fetch assignment history
        const historyResponse = await projectsApi.getAssignmentHistory(projectId);
        setAssignmentHistory(historyResponse);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data');
      } finally {
        setLoadingUsers(false);
        setLoadingHistory(false);
      }
    };

    fetchData();
  }, [isOpen, projectId]);

  const onSubmit = async (data: ReassignPCDto) => {
    try {
      setError('');
      setIsLoading(true);
      
      await projectsApi.reassignPCOrTL(projectId, data);
      
      reset();
      onReassignSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reassign');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const availableUsers = users.filter(user => {
    if (selectedAssignmentType === 'PROJECT_COORDINATOR') {
      return user.roleMaster?.code === 'PC';
    } else if (selectedAssignmentType === 'PC_TEAM_LEAD') {
      return ['PC_TL1', 'PC_TL2'].includes(user.roleMaster?.code || '');
    }
    return false;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reassign Project Coordinator / Team Lead</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Assignments */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Current Assignments</h3>
              
              <div className="space-y-2">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm text-gray-600">Project Coordinator</div>
                  <div className="text-sm">
                    {currentPC ? `${currentPC.name} (${currentPC.email})` : 'Not assigned'}
                  </div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm text-gray-600">PC Team Lead</div>
                  <div className="text-sm">
                    {currentPCTL ? `${currentPCTL.name} (${currentPCTL.email}) - ${currentPCTL.role}` : 'Not assigned'}
                  </div>
                </div>
              </div>

              {/* Assignment History */}
              <div className="space-y-2">
                <h4 className="font-medium">Assignment History</h4>
                {loadingHistory ? (
                  <div className="text-sm text-gray-500">Loading history...</div>
                ) : assignmentHistory.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {assignmentHistory.map((history) => (
                      <div key={history.id} className="p-2 border rounded text-sm">
                        <div className="font-medium">
                          {history.assignmentType.replace('_', ' ')}
                        </div>
                        <div className="text-gray-600">
                          {history.previousUser ? 
                            `${history.previousUser.name} → ` : 
                            'New assignment → '
                          }
                          {history.newUserId ? 'New user assigned' : 'Unassigned'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(history.assignedAt).toLocaleDateString()} by {history.assignedBy.name}
                        </div>
                        {history.reason && (
                          <div className="text-xs text-gray-600 mt-1">
                            Reason: {history.reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No assignment history</div>
                )}
              </div>
            </div>

            {/* Reassignment Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">New Assignment</h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="assignmentType" className="text-sm font-medium">
                    Assignment Type *
                  </label>
                  <select
                    id="assignmentType"
                    {...register('assignmentType')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select assignment type</option>
                    <option value="PROJECT_COORDINATOR">Project Coordinator (PC)</option>
                    <option value="PC_TEAM_LEAD">PC Team Lead</option>
                  </select>
                  {errors.assignmentType && (
                    <p className="text-sm text-red-500">{errors.assignmentType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="newUserId" className="text-sm font-medium">
                    Select User *
                  </label>
                  <select
                    id="newUserId"
                    {...register('newUserId')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={loadingUsers || !selectedAssignmentType}
                  >
                    <option value="">
                      {!selectedAssignmentType 
                        ? 'Select assignment type first' 
                        : loadingUsers 
                        ? 'Loading users...' 
                        : 'Select user'
                      }
                    </option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) {user.roleMaster?.code !== 'PC' && `- ${user.roleMaster?.code}`}
                      </option>
                    ))}
                  </select>
                  {errors.newUserId && (
                    <p className="text-sm text-red-500">{errors.newUserId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="reason" className="text-sm font-medium">
                    Reason
                  </label>
                  <Input
                    id="reason"
                    {...register('reason')}
                    placeholder="Reason for reassignment..."
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    {...register('notes')}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Additional notes..."
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-500 text-center">{error}</div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || loadingUsers}>
                    {isLoading ? 'Reassigning...' : 'Reassign'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}