import { useState } from 'react';
import { ChevronDown, ChevronRight, BarChart3, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project, Department, ProjectStatus, DepartmentMaster } from '@/types';
import EnhancedProjectCard from './EnhancedProjectCard';
import ProjectListItem from './ProjectListItem';

interface GroupedProjectViewProps {
  projects: Project[];
  groupBy: 'department' | 'status' | 'health' | 'dueDate' | 'none';
  viewMode: 'grid' | 'list';
  departments?: DepartmentMaster[];
  onQuickEdit?: (project: Project) => void;
  onMoveProject?: (project: Project) => void;
  onViewDetails?: (project: Project) => void;
}

interface ProjectGroup {
  key: string;
  label: string;
  icon: string;
  color: string;
  projects: Project[];
  stats: {
    total: number;
    overdue: number;
    critical: number;
    avgHealth: number;
  };
}

const departmentConfig = {
  [Department.PMO]: { icon: '📋', color: 'bg-blue-100 text-blue-800 border-blue-300', name: 'PMO' },
  [Department.DESIGN]: { icon: '🎨', color: 'bg-purple-100 text-purple-800 border-purple-300', name: 'Design' },
  [Department.HTML]: { icon: '🏗️', color: 'bg-orange-100 text-orange-800 border-orange-300', name: 'HTML' },
  [Department.PHP]: { icon: '🔧', color: 'bg-red-100 text-red-800 border-red-300', name: 'PHP' },
  [Department.REACT]: { icon: '⚛️', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', name: 'React' },
  [Department.WORDPRESS]: { icon: '📝', color: 'bg-green-100 text-green-800 border-green-300', name: 'WordPress' },
  [Department.QA]: { icon: '🧪', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', name: 'QA' },
  [Department.DELIVERY]: { icon: '🚀', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', name: 'Delivery' },
  [Department.MANAGER]: { icon: '👔', color: 'bg-slate-100 text-slate-800 border-slate-300', name: 'Manager' }
};

const statusConfig = {
  [ProjectStatus.ACTIVE]: { icon: '🟢', color: 'bg-green-100 text-green-800 border-green-300', name: 'Active' },
  [ProjectStatus.HOLD]: { icon: '🟡', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', name: 'On Hold' },
  [ProjectStatus.COMPLETED]: { icon: '🟦', color: 'bg-blue-100 text-blue-800 border-blue-300', name: 'Completed' },
  [ProjectStatus.CANCELLED]: { icon: '🔴', color: 'bg-red-100 text-red-800 border-red-300', name: 'Cancelled' }
};

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
  if (project.status === 'COMPLETED') score = Math.max(score + 10, 100);
  if (project.deviationReason) score -= 15;
  
  return Math.max(0, Math.min(100, score));
};

const getHealthCategory = (score: number): string => {
  if (score < 50) return 'critical';
  if (score < 70) return 'at-risk';
  if (score < 85) return 'good';
  return 'healthy';
};

const getDueDateCategory = (targetDate: string): string => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'this-week';
  if (diffDays <= 30) return 'this-month';
  return 'future';
};

const groupProjects = (projects: Project[], groupBy: string): ProjectGroup[] => {
  const groups: { [key: string]: Project[] } = {};
  
  projects.forEach(project => {
    let key: string;
    
    switch (groupBy) {
      case 'department':
        key = project.currentDepartment;
        break;
      case 'status':
        key = project.status;
        break;
      case 'health':
        key = getHealthCategory(calculateHealthScore(project));
        break;
      case 'dueDate':
        key = getDueDateCategory(project.targetDate);
        break;
      default:
        key = 'all';
    }
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(project);
  });

  const result: ProjectGroup[] = Object.entries(groups).map(([key, groupProjects]) => {
    const stats = {
      total: groupProjects.length,
      overdue: groupProjects.filter(p => new Date(p.targetDate) < new Date()).length,
      critical: groupProjects.filter(p => calculateHealthScore(p) < 50).length,
      avgHealth: Math.round(groupProjects.reduce((sum, p) => sum + calculateHealthScore(p), 0) / groupProjects.length)
    };

    let label: string, icon: string, color: string;
    
    switch (groupBy) {
      case 'department':
        const deptConfig = departmentConfig[key as Department];
        label = deptConfig.name;
        icon = deptConfig.icon;
        color = deptConfig.color;
        break;
      case 'status':
        const statConfig = statusConfig[key as ProjectStatus];
        label = statConfig.name;
        icon = statConfig.icon;
        color = statConfig.color;
        break;
      case 'health':
        const healthConfigs = {
          'critical': { icon: '🔴', color: 'bg-red-100 text-red-800 border-red-300', name: 'Critical' },
          'at-risk': { icon: '🟡', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', name: 'At Risk' },
          'good': { icon: '🟠', color: 'bg-blue-100 text-blue-800 border-blue-300', name: 'Good' },
          'healthy': { icon: '🟢', color: 'bg-green-100 text-green-800 border-green-300', name: 'Healthy' }
        };
        const healthConfig = healthConfigs[key as keyof typeof healthConfigs];
        label = healthConfig.name;
        icon = healthConfig.icon;
        color = healthConfig.color;
        break;
      case 'dueDate':
        const dueDateConfigs = {
          'overdue': { icon: '🔴', color: 'bg-red-100 text-red-800 border-red-300', name: 'Overdue' },
          'this-week': { icon: '🟠', color: 'bg-orange-100 text-orange-800 border-orange-300', name: 'Due This Week' },
          'this-month': { icon: '🟡', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', name: 'Due This Month' },
          'future': { icon: '🟢', color: 'bg-green-100 text-green-800 border-green-300', name: 'Future' }
        };
        const dueDateConfig = dueDateConfigs[key as keyof typeof dueDateConfigs];
        label = dueDateConfig.name;
        icon = dueDateConfig.icon;
        color = dueDateConfig.color;
        break;
      default:
        label = 'All Projects';
        icon = '📁';
        color = 'bg-gray-100 text-gray-800 border-gray-300';
    }

    return {
      key,
      label,
      icon,
      color,
      projects: groupProjects,
      stats
    };
  });

  // Sort groups by department order or other logical ordering
  if (groupBy === 'department') {
    const departmentOrder = [Department.PMO, Department.DESIGN, Department.HTML, Department.PHP, Department.REACT, Department.WORDPRESS, Department.QA, Department.DELIVERY];
    result.sort((a, b) => departmentOrder.indexOf(a.key as Department) - departmentOrder.indexOf(b.key as Department));
  }

  return result;
};

export default function GroupedProjectView({
  projects,
  groupBy,
  viewMode,
  departments = [],
  onQuickEdit,
  onMoveProject,
  onViewDetails
}: GroupedProjectViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  
  const toggleGroup = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey);
    } else {
      newCollapsed.add(groupKey);
    }
    setCollapsedGroups(newCollapsed);
  };

  if (groupBy === 'none') {
    // Render without grouping
    if (viewMode === 'list') {
      return (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              departments={departments}
              onQuickEdit={onQuickEdit}
              onMoveProject={() => onMoveProject?.(project)}
              onViewDetails={() => onViewDetails?.(project)}
            />
          ))}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <EnhancedProjectCard
              key={project.id}
              project={project}
              onQuickEdit={onQuickEdit}
              onMoveProject={() => onMoveProject?.(project)}
              onViewDetails={() => onViewDetails?.(project)}
            />
          ))}
        </div>
      );
    }
  }

  const groups = groupProjects(projects, groupBy);

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const isCollapsed = collapsedGroups.has(group.key);
        
        return (
          <Card key={group.key} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleGroup(group.key)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                    <Badge className={`${group.color} border flex items-center gap-2 px-3 py-1`}>
                      <span className="text-base">{group.icon}</span>
                      <span className="font-semibold">{group.label}</span>
                      <span className="text-sm">({group.stats.total})</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Group Stats */}
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    {group.stats.avgHealth && (
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>{group.stats.avgHealth}% avg</span>
                      </div>
                    )}
                    {group.stats.overdue > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <Clock className="h-4 w-4" />
                        <span>{group.stats.overdue} overdue</span>
                      </div>
                    )}
                    {group.stats.critical > 0 && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{group.stats.critical} critical</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions for Group */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add group-level actions here
                      }}
                    >
                      Actions
                    </Button>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            
            {!isCollapsed && (
              <CardContent className="pt-0">
                {viewMode === 'list' ? (
                  <div className="space-y-3">
                    {group.projects.map((project) => (
                      <ProjectListItem
                        key={project.id}
                        project={project}
                        departments={departments}
                        onQuickEdit={onQuickEdit}
                        onMoveProject={() => onMoveProject?.(project)}
                        onViewDetails={() => onViewDetails?.(project)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.projects.map((project) => (
                      <EnhancedProjectCard
                        key={project.id}
                        project={project}
                        onQuickEdit={onQuickEdit}
                        onMoveProject={() => onMoveProject?.(project)}
                        onViewDetails={() => onViewDetails?.(project)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}