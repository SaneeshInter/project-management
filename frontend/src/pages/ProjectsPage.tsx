import { useEffect, useState } from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProjectsStore } from '@/stores/projects';
import { 
  Project, 
  ProjectStatus, 
  ProjectCategory, 
  Department,
  Office,
  DepartmentMaster
} from '@/types';
import { departmentsApi } from '@/lib/api';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import AdvancedProjectFilters from '@/components/projects/AdvancedProjectFilters';
import GroupedProjectView from '@/components/projects/GroupedProjectView';
import ProjectViewControls from '@/components/projects/ProjectViewControls';
import SimpleDepartmentPipeline from '@/components/projects/SimpleDepartmentPipeline';
import AlertDialog from '@/components/ui/alert-dialog';

interface FilterOptions {
  searchTerm: string;
  status: ProjectStatus | 'ALL';
  category: ProjectCategory | 'ALL';
  department: Department | 'ALL';
  office: Office | 'ALL';
  healthScore: 'ALL' | 'CRITICAL' | 'AT_RISK' | 'GOOD' | 'HEALTHY';
  timeStatus: 'ALL' | 'OVERDUE' | 'DUE_SOON' | 'ON_TRACK';
  sortBy: 'name' | 'targetDate' | 'healthScore' | 'progress' | 'createdAt' | 'lastActivity';
  sortOrder: 'asc' | 'desc';
  showOnlyActive: boolean;
  showOverdueOnly: boolean;
  showWithDependencies: boolean;
  showDisabled: boolean;
}

const calculateHealthScore = (project: Project): number => {
  let score = 100;
  const now = new Date();
  const targetDate = new Date(project.targetDate);
  const isOverdue = targetDate < now;
  const daysUntilTarget = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (isOverdue) score -= 30;
  else if (daysUntilTarget <= 3) score -= 15;
  else if (daysUntilTarget <= 7) score -= 10;
  
  if (project.dependency) score -= 10;
  if (project.status === 'HOLD') score -= 20;
  if (project.status === 'CANCELLED') score -= 40;
  if (project.status === 'ARCHIVED') score -= 5;
  if (project.status === 'COMPLETED') score = Math.max(score + 10, 100);
  if (project.disabled) score -= 50;
  if (project.deviationReason) score -= 15;
  
  return Math.max(0, Math.min(100, score));
};

const getDepartmentProgress = (currentDept: Department, departments: DepartmentMaster[]): number => {
  // Filter root level departments (no parent) and sort by common order
  const rootDepartments = departments.filter(d => !d.parentId);
  const departmentOrder = ['PMO', 'DESIGN', 'HTML', 'DEV', 'QA', 'DELIVERY', 'MANAGER'];
  
  const sortedDepts = rootDepartments.sort((a, b) => {
    const aIndex = departmentOrder.indexOf(a.code);
    const bIndex = departmentOrder.indexOf(b.code);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
  
  const currentIndex = sortedDepts.findIndex(d => d.code === currentDept);
  return currentIndex !== -1 ? ((currentIndex + 1) / sortedDepts.length) * 100 : 0;
};

export default function ProjectsPage() {
  const { projects, fetchProjects, isLoading } = useProjectsStore();
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [groupBy, setGroupBy] = useState<'department' | 'status' | 'health' | 'dueDate' | 'none'>('department');
  const [showStats, setShowStats] = useState(true);
  const [errorAlert, setErrorAlert] = useState<{ title: string; message: string; suggestion?: string } | null>(null);
  const [departments, setDepartments] = useState<DepartmentMaster[]>([]);
  
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    status: 'ALL',
    category: 'ALL',
    department: 'ALL',
    office: 'ALL',
    healthScore: 'ALL',
    timeStatus: 'ALL',
    sortBy: 'name',
    sortOrder: 'asc',
    showOnlyActive: false,
    showOverdueOnly: false,
    showWithDependencies: false,
    showDisabled: false
  });

  useEffect(() => {
    fetchProjects();
    
    // Fetch departments for progress calculation
    const fetchDepartments = async () => {
      try {
        const departmentData = await departmentsApi.getAll();
        setDepartments(departmentData);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };
    
    fetchDepartments();
  }, [fetchProjects]);

  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.office.toLowerCase().includes(searchLower) ||
        project.clientName?.toLowerCase().includes(searchLower) ||
        project.projectCode.toLowerCase().includes(searchLower) ||
        project.owner.name.toLowerCase().includes(searchLower)
      );
    }

    // Basic filters
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(project => project.status === filters.status);
    }
    if (filters.category !== 'ALL') {
      filtered = filtered.filter(project => project.category === filters.category);
    }
    if (filters.department !== 'ALL') {
      filtered = filtered.filter(project => project.currentDepartment === filters.department);
    }
    if (filters.office !== 'ALL') {
      filtered = filtered.filter(project => project.office === filters.office);
    }

    // Advanced filters
    if (filters.healthScore !== 'ALL') {
      filtered = filtered.filter(project => {
        const score = calculateHealthScore(project);
        switch (filters.healthScore) {
          case 'CRITICAL': return score < 50;
          case 'AT_RISK': return score >= 50 && score < 70;
          case 'GOOD': return score >= 70 && score < 85;
          case 'HEALTHY': return score >= 85;
          default: return true;
        }
      });
    }

    if (filters.timeStatus !== 'ALL') {
      const now = new Date();
      filtered = filtered.filter(project => {
        const targetDate = new Date(project.targetDate);
        const daysUntilTarget = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.timeStatus) {
          case 'OVERDUE': return daysUntilTarget < 0;
          case 'DUE_SOON': return daysUntilTarget >= 0 && daysUntilTarget <= 7;
          case 'ON_TRACK': return daysUntilTarget > 7;
          default: return true;
        }
      });
    }

    // Boolean filters
    if (filters.showOnlyActive) {
      filtered = filtered.filter(project => project.status === 'ACTIVE');
    }
    if (filters.showOverdueOnly) {
      const now = new Date();
      filtered = filtered.filter(project => new Date(project.targetDate) < now);
    }
    if (filters.showWithDependencies) {
      filtered = filtered.filter(project => project.dependency);
    }
    
    // Filter disabled projects (by default hide them unless explicitly requested)
    if (!filters.showDisabled) {
      filtered = filtered.filter(project => !project.disabled);
    } else if (filters.showDisabled) {
      // If showDisabled is true, only show disabled projects
      filtered = filtered.filter(project => project.disabled);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'targetDate':
          aValue = new Date(a.targetDate).getTime();
          bValue = new Date(b.targetDate).getTime();
          break;
        case 'healthScore':
          aValue = calculateHealthScore(a);
          bValue = calculateHealthScore(b);
          break;
        case 'progress':
          aValue = getDepartmentProgress(a.currentDepartment, departments);
          bValue = getDepartmentProgress(b.currentDepartment, departments);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'lastActivity':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (filters.sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    setFilteredProjects(filtered);
  }, [projects, filters]);

  const handlePresetFilter = (preset: string) => {
    switch (preset) {
      case 'needs_attention':
        setFilters(prev => ({
          ...prev,
          healthScore: 'CRITICAL',
          timeStatus: 'OVERDUE',
          sortBy: 'healthScore',
          sortOrder: 'asc'
        }));
        break;
      case 'due_soon':
        setFilters(prev => ({
          ...prev,
          timeStatus: 'DUE_SOON',
          sortBy: 'targetDate',
          sortOrder: 'asc'
        }));
        break;
      case 'my_projects':
        // This would need user context - placeholder for now
        setFilters(prev => ({ ...prev, showOnlyActive: true }));
        break;
      case 'high_performance':
        setFilters(prev => ({
          ...prev,
          healthScore: 'HEALTHY',
          sortBy: 'healthScore',
          sortOrder: 'desc'
        }));
        break;
    }
  };


  const getProjectStats = () => {
    const total = filteredProjects.length;
    const active = filteredProjects.filter(p => p.status === 'ACTIVE').length;
    const completed = filteredProjects.filter(p => p.status === 'COMPLETED').length;
    const overdue = filteredProjects.filter(p => new Date(p.targetDate) < new Date()).length;
    const critical = filteredProjects.filter(p => calculateHealthScore(p) < 50).length;
    
    return { total, active, completed, overdue, critical };
  };

  const stats = getProjectStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Comprehensive project management and tracking</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            {showStats ? 'Hide' : 'Show'} Stats
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* View Controls */}
      <ProjectViewControls
        viewMode={viewMode}
        groupBy={groupBy}
        onViewModeChange={setViewMode}
        onGroupByChange={setGroupBy}
      />

      {/* Statistics */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.critical}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department Pipeline */}
      {groupBy === 'department' && filteredProjects.length > 0 && (
        <SimpleDepartmentPipeline
          projects={projects}
          onDepartmentClick={(dept) => {
            setFilters(prev => ({ ...prev, department: dept }));
          }}
        />
      )}

      {/* Advanced Filters */}
      <AdvancedProjectFilters
        filters={filters}
        onFiltersChange={setFilters}
        onPresetFilter={handlePresetFilter}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredProjects.length} of {projects.length} projects
          {filters.searchTerm && (
            <span> • Search: "{filters.searchTerm}"</span>
          )}
        </div>
        {filteredProjects.length > 0 && (
          <div className="flex items-center gap-4">
            <span>Sorted by {filters.sortBy} ({filters.sortOrder})</span>
          </div>
        )}
      </div>

      {/* Projects Display */}
      {isLoading ? (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <GroupedProjectView
          projects={filteredProjects}
          groupBy={groupBy}
          viewMode={viewMode}
          departments={departments}
        />
      )}

      {/* Empty State */}
      {!isLoading && filteredProjects.length === 0 && (
        <div className="text-center py-16">
          <div className="text-muted-foreground mb-4 text-lg">No projects found</div>
          {filters.searchTerm || Object.values(filters).some(v => v !== 'ALL' && v !== '' && v !== false && v !== 'name' && v !== 'asc') ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search criteria
              </p>
              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  searchTerm: '',
                  status: 'ALL',
                  category: 'ALL',
                  department: 'ALL',
                  office: 'ALL',
                  healthScore: 'ALL',
                  timeStatus: 'ALL',
                  sortBy: 'name',
                  sortOrder: 'asc',
                  showOnlyActive: false,
                  showOverdueOnly: false,
                  showWithDependencies: false,
                  showDisabled: false
                })}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first project
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      
      {errorAlert && (
        <AlertDialog
          isOpen={!!errorAlert}
          onClose={() => setErrorAlert(null)}
          title={errorAlert.title}
          message={errorAlert.message}
          suggestion={errorAlert.suggestion}
          type="error"
        />
      )}
    </div>
  );
}