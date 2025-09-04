import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Building2, Tag, History, Clock, AlertTriangle, Workflow } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProjectsStore } from '@/stores/projects';
import { getStatusColor } from '@/lib/utils';
import DepartmentWorkflowCard from '@/components/projects/DepartmentWorkflowCard';
import ProjectTimelineView from '@/components/projects/ProjectTimelineView';
import DepartmentWorkTracker from '@/components/projects/DepartmentWorkTracker';
import CorrectionsPanel from '@/components/projects/CorrectionsPanel';
import WorkflowDashboard from '@/components/projects/WorkflowDashboard';
import WorkflowEnforcer from '@/components/projects/WorkflowEnforcer';
import ProjectOverviewHero from '@/components/projects/ProjectOverviewHero';
import ProjectMetricsDashboard from '@/components/projects/ProjectMetricsDashboard';
import DepartmentChecklist from '@/components/projects/DepartmentChecklist';
import { ProjectDepartmentHistory, ApprovalType, ApprovalStatus, QAType, QAStatus } from '@/types';
import { projectsApi } from '@/lib/api';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentProject, fetchProject, isLoading } = useProjectsStore();
  const [departmentHistory, setDepartmentHistory] = useState<ProjectDepartmentHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'tracker' | 'corrections' | 'workflow'>('overview');

  useEffect(() => {
    if (id) {
      fetchProject(id);
      loadDepartmentHistory();
    }
  }, [id, fetchProject]);

  const loadDepartmentHistory = async () => {
    if (!id) return;
    try {
      const history = await projectsApi.getDepartmentHistory(id);
      setDepartmentHistory(history);
    } catch (error) {
      console.error('Failed to load department history:', error);
    }
  };

  const handleProjectUpdate = () => {
    if (id) {
      fetchProject(id);
      loadDepartmentHistory();
    }
  };

  const handleRequestApproval = async (historyId: string, approvalType: ApprovalType) => {
    if (!id) return;
    try {
      await projectsApi.requestApproval(id, historyId, approvalType);
      toast.success('Approval request submitted successfully');
      handleProjectUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request approval');
    }
  };

  const handleSubmitApproval = async (approvalId: string, status: ApprovalStatus, comments?: string) => {
    if (!id) return;
    try {
      await projectsApi.submitApproval(id, approvalId, status, comments);
      toast.success(`Approval ${status.toLowerCase()} successfully`);
      handleProjectUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit approval');
    }
  };

  const handleStartQA = async (historyId: string, qaType: QAType, testerId: string) => {
    if (!id) return;
    try {
      await projectsApi.startQATesting(id, historyId, qaType, testerId);
      toast.success('QA testing started successfully');
      handleProjectUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start QA testing');
    }
  };

  const handleCompleteQA = async (qaRoundId: string, status: QAStatus, bugsFound: number, criticalBugs: number) => {
    if (!id) return;
    try {
      await projectsApi.completeQATesting(id, qaRoundId, status, bugsFound, criticalBugs);
      toast.success('QA testing completed successfully');
      handleProjectUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete QA testing');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
        <Button asChild className="mt-4">
          <Link to="/projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link to="/projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{currentProject.name}</h1>
            {currentProject.projectCode && (
              <Badge variant="outline" className="text-base sm:text-lg font-mono bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 border-blue-200">
                {currentProject.projectCode}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              <span>{currentProject.office}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>{currentProject.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{currentProject.owner.name}</span>
            </div>
          </div>
        </div>
        <Badge className={getStatusColor(currentProject.status)}>
          {currentProject.status}
        </Badge>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 md:space-x-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
          {[
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'workflow', label: 'Workflow', icon: Workflow },
            { id: 'timeline', label: 'Timeline', icon: History },
            { id: 'tracker', label: 'Work Tracker', icon: Clock },
            { id: 'corrections', label: 'Corrections', icon: AlertTriangle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Hero Section with Key Metrics */}
          <ProjectOverviewHero project={currentProject} />
          
          {/* Comprehensive Metrics Dashboard */}
          <ProjectMetricsDashboard project={currentProject} />

          {/* Department Checklist */}
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Checklist</h3>
              <DepartmentChecklist 
                projectId={currentProject.id}
                department={currentProject.currentDepartment}
                onProgressUpdate={(progress) => {
                  console.log('Checklist progress updated:', progress);
                }}
              />
            </div>
          </div>

          {/* Department Workflow Management */}
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Workflow</h3>
              
              <WorkflowEnforcer
                projectId={currentProject.id}
                currentDepartment={currentProject.currentDepartment}
                canManageDepartments={true}
                onDepartmentMove={(dept) => {
                  console.log(`Moving to ${dept}`);
                }}
              />

              <div className="mt-6">
                <DepartmentWorkflowCard 
                  project={currentProject} 
                  canManageDepartments={true}
                  onUpdate={handleProjectUpdate}
                />
              </div>
            </div>
          </div>

          {/* Additional Project Information */}
          {(currentProject.clientName || (currentProject.customFields && currentProject.customFields.length > 0)) && (
            <div className="border-t pt-6 space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {currentProject.clientName && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{currentProject.clientName}</div>
                          <div className="text-sm text-gray-600">Project Client</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentProject.customFields && currentProject.customFields.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Custom Fields</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentProject.customFields.map((field) => (
                          <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700">{field.fieldName}:</span>
                            <span className="text-gray-900">{field.fieldValue}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workflow Tab */}
      {activeTab === 'workflow' && (
        <div className="max-w-6xl">
          <WorkflowDashboard
            project={currentProject}
            departmentHistory={departmentHistory}
            onRequestApproval={handleRequestApproval}
            onSubmitApproval={handleSubmitApproval}
            onStartQA={handleStartQA}
            onCompleteQA={handleCompleteQA}
          />
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="max-w-6xl">
          <ProjectTimelineView 
            projectId={currentProject.id}
            departmentHistory={departmentHistory}
          />
        </div>
      )}

      {/* Work Tracker Tab */}
      {activeTab === 'tracker' && (
        <div className="max-w-4xl">
          <DepartmentWorkTracker
            project={currentProject}
            currentHistory={departmentHistory.find(h => h.toDepartment === currentProject.currentDepartment)}
            onUpdate={handleProjectUpdate}
            canManageWork={true}
          />
        </div>
      )}

      {/* Corrections Tab */}
      {activeTab === 'corrections' && (
        <div className="max-w-4xl">
          <CorrectionsPanel
            projectId={currentProject.id}
            departmentHistory={departmentHistory}
            onUpdate={handleProjectUpdate}
            canManageCorrections={true}
          />
        </div>
      )}
    </div>
  );
}