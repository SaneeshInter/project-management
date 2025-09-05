import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Building2, Tag, LayoutDashboard, Activity, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProjectsStore } from '@/stores/projects';
import { useAuthStore } from '@/stores/auth';
import { getStatusColor } from '@/lib/utils';
import ProjectOverviewHero from '@/components/projects/ProjectOverviewHero';
import ProjectMetricsDashboard from '@/components/projects/ProjectMetricsDashboard';
import ProjectStatusManager from '@/components/projects/ProjectStatusManager';
import DepartmentChecklist from '@/components/projects/DepartmentChecklist';
import DepartmentHandover from '@/components/projects/DepartmentHandover';
import ProjectTimelineTab from '@/components/projects/ProjectTimelineTab';
import ProjectFilesTab from '@/components/projects/ProjectFilesTab';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentProject, fetchProject, isLoading } = useProjectsStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id, fetchProject]);


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
              <Tag className="w-4 h-4" />
              <span>{currentProject.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              <span>{currentProject.currentDepartment.replace('_', ' ')} Department</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(currentProject.status)}>
            {currentProject.status}
          </Badge>
          <ProjectStatusManager
            project={currentProject}
            userRole={user?.role}
            onProjectUpdated={(updatedProject) => {
              // Update the current project in store
              if (id) {
                fetchProject(id);
              }
            }}
          />
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger 
            value="overview" 
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Project Overview
          </TabsTrigger>
          <TabsTrigger 
            value="timeline"
            isActive={activeTab === 'timeline'}
            onClick={() => setActiveTab('timeline')}
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Timeline & History
          </TabsTrigger>
          <TabsTrigger 
            value="files"
            isActive={activeTab === 'files'}
            onClick={() => setActiveTab('files')}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Files & Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" isActive={activeTab === 'overview'}>
          <div className="space-y-8">
            {/* Hero Section with Key Metrics */}
            <ProjectOverviewHero project={currentProject} />
            
            {/* Comprehensive Metrics Dashboard */}
            <ProjectMetricsDashboard project={currentProject} />

            {/* Department Checklist and Handover */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Checklist</h3>
                  <DepartmentChecklist 
                    projectId={currentProject.id}
                    department={currentProject.currentDepartment}
                    onProgressUpdate={(progress) => {
                      console.log('Checklist progress updated:', progress);
                    }}
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Department Handover</h3>
                  <DepartmentHandover 
                    project={currentProject}
                    canManageDepartments={true}
                    onUpdate={() => {
                      fetchProject(currentProject.id);
                    }}
                  />
                </div>
              </div>
            </div>

          </div>
        </TabsContent>

        <TabsContent value="timeline" isActive={activeTab === 'timeline'}>
          <ProjectTimelineTab project={currentProject} />
        </TabsContent>

        <TabsContent value="files" isActive={activeTab === 'files'}>
          <ProjectFilesTab project={currentProject} />
        </TabsContent>
      </Tabs>
    </div>
  );
}