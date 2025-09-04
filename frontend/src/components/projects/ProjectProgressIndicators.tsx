import { 
  TrendingDown, Clock, AlertTriangle, 
  CheckCircle, Pause, Play, Target,
  Users, MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Project, Department, DepartmentMaster } from '@/types';

interface ProgressIndicatorsProps {
  project: Project;
  departments?: DepartmentMaster[];
}

interface ProjectHealthMetrics {
  score: number;
  indicators: {
    type: 'success' | 'warning' | 'error' | 'info';
    label: string;
    icon: React.ReactNode;
  }[];
}

const getDepartmentProgress = (currentDept: Department, departments: DepartmentMaster[] = []): number => {
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

const calculateProjectHealth = (project: Project): ProjectHealthMetrics => {
  const indicators: ProjectHealthMetrics['indicators'] = [];
  let score = 100;
  
  const now = new Date();
  const targetDate = new Date(project.targetDate);
  const isOverdue = targetDate < now;
  const daysUntilTarget = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Time-based indicators
  if (isOverdue) {
    score -= 30;
    indicators.push({
      type: 'error',
      label: `${Math.abs(daysUntilTarget)} days overdue`,
      icon: <AlertTriangle className="h-3 w-3" />
    });
  } else if (daysUntilTarget <= 3) {
    score -= 15;
    indicators.push({
      type: 'warning',
      label: `${daysUntilTarget} days left`,
      icon: <Clock className="h-3 w-3" />
    });
  } else if (daysUntilTarget <= 7) {
    score -= 10;
    indicators.push({
      type: 'warning',
      label: 'Due soon',
      icon: <Target className="h-3 w-3" />
    });
  }
  
  // Status-based indicators
  if (project.status === 'HOLD') {
    score -= 20;
    indicators.push({
      type: 'warning',
      label: 'On hold',
      icon: <Pause className="h-3 w-3" />
    });
  } else if (project.status === 'COMPLETED') {
    score = Math.max(score + 10, 100);
    indicators.push({
      type: 'success',
      label: 'Completed',
      icon: <CheckCircle className="h-3 w-3" />
    });
  } else if (project.status === 'ACTIVE') {
    indicators.push({
      type: 'info',
      label: 'Active',
      icon: <Play className="h-3 w-3" />
    });
  }
  
  // Dependency indicators
  if (project.dependency) {
    score -= 10;
    indicators.push({
      type: 'warning',
      label: 'Has dependencies',
      icon: <AlertTriangle className="h-3 w-3" />
    });
  }
  
  // Deviation indicators
  if (project.deviationReason) {
    score -= 15;
    indicators.push({
      type: 'warning',
      label: 'Timeline deviation',
      icon: <TrendingDown className="h-3 w-3" />
    });
  }
  
  // Activity indicators
  if (project._count?.tasks && project._count.tasks > 0) {
    indicators.push({
      type: 'info',
      label: `${project._count.tasks} tasks`,
      icon: <Users className="h-3 w-3" />
    });
  }
  
  if (project._count?.comments && project._count.comments > 0) {
    indicators.push({
      type: 'info',
      label: `${project._count.comments} comments`,
      icon: <MessageSquare className="h-3 w-3" />
    });
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return { score, indicators };
};

const getHealthColor = (score: number): string => {
  if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

const getIndicatorColor = (type: string): string => {
  switch (type) {
    case 'success': return 'bg-green-100 text-green-800 border-green-300';
    case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'error': return 'bg-red-100 text-red-800 border-red-300';
    case 'info': return 'bg-blue-100 text-blue-800 border-blue-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export function ProjectHealthScore({ project }: ProgressIndicatorsProps) {
  const health = calculateProjectHealth(project);
  const healthColor = getHealthColor(health.score);
  
  return (
    <div className={`px-6 py-4 rounded-xl border-2 ${healthColor} text-center shadow-sm hover:shadow-md transition-all`}>
      <div className="text-3xl font-bold mb-1">{health.score}%</div>
      <div className="text-sm font-medium opacity-80">Health Score</div>
      {health.score >= 85 && <div className="text-xs mt-1 opacity-60">Excellent</div>}
      {health.score >= 70 && health.score < 85 && <div className="text-xs mt-1 opacity-60">Good</div>}
      {health.score >= 50 && health.score < 70 && <div className="text-xs mt-1 opacity-60">At Risk</div>}
      {health.score < 50 && <div className="text-xs mt-1 opacity-60">Critical</div>}
    </div>
  );
}

export function ProjectHealthIndicators({ project }: ProgressIndicatorsProps) {
  const health = calculateProjectHealth(project);
  
  return (
    <div className="flex flex-wrap gap-1">
      {health.indicators.slice(0, 4).map((indicator, index) => (
        <Badge
          key={index}
          variant="outline"
          className={`text-xs ${getIndicatorColor(indicator.type)} flex items-center gap-1`}
        >
          {indicator.icon}
          {indicator.label}
        </Badge>
      ))}
    </div>
  );
}

export function DepartmentProgressBar({ project, departments = [] }: ProgressIndicatorsProps) {
  const progress = getDepartmentProgress(project.currentDepartment, departments);
  const rootDepartments = departments.filter(d => !d.parentId);
  const departmentOrder = ['PMO', 'DESIGN', 'HTML', 'DEV', 'QA', 'DELIVERY', 'MANAGER'];
  const sortedDepts = rootDepartments.sort((a, b) => {
    const aIndex = departmentOrder.indexOf(a.code);
    const bIndex = departmentOrder.indexOf(b.code);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
  const currentIndex = sortedDepts.findIndex(d => d.code === project.currentDepartment);
  
  return (
    <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-gray-900">Department Progress</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
          <div className="text-xs text-gray-600">Complete</div>
        </div>
      </div>
      
      <div className="w-full bg-white rounded-full h-4 shadow-inner relative overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${progress}%` }}
        ></div>
        
        {/* Department markers */}
        <div className="absolute inset-0 flex justify-between items-center px-2">
          {departmentOrder.map((dept, index) => {
            const isActive = index <= currentIndex;
            return (
              <div
                key={dept}
                className={`w-2 h-2 rounded-full border transition-all duration-300 ${
                  isActive ? 'bg-white border-blue-300 shadow-sm' : 'bg-gray-300 border-gray-400'
                }`}
                title={dept.replace('_', ' ')}
              />
            );
          })}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          <span className="font-medium">Start:</span> {sortedDepts[0]?.name || 'PMO'}
        </div>
        <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
          {departments.find(d => d.code === project.currentDepartment)?.name || project.currentDepartment.replace('_', ' ')}
        </div>
        <div className="text-gray-600">
          <span className="font-medium">End:</span> {sortedDepts[sortedDepts.length - 1]?.name || 'Delivery'}
        </div>
      </div>
    </div>
  );
}

export function MiniTimeline({ project, departments = [] }: ProgressIndicatorsProps) {
  const rootDepartments = departments.filter(d => !d.parentId);
  const departmentOrder = ['PMO', 'DESIGN', 'HTML', 'DEV', 'QA', 'DELIVERY', 'MANAGER'];
  const sortedDepts = rootDepartments.sort((a, b) => {
    const aIndex = departmentOrder.indexOf(a.code);
    const bIndex = departmentOrder.indexOf(b.code);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
  const currentIndex = sortedDepts.findIndex(d => d.code === project.currentDepartment);
  
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Workflow Timeline</div>
      <div className="flex items-center gap-1 overflow-hidden">
        {sortedDepts.map((dept, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isNext = dept.code === project.nextDepartment;
          
          return (
            <div key={dept.id} className="flex items-center flex-shrink-0">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all
                ${isPast ? 'bg-green-500 border-green-500 text-white' :
                  isCurrent ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
                  isNext ? 'bg-yellow-400 border-yellow-400 text-gray-800' :
                  'bg-gray-200 border-gray-300 text-gray-500'}
              `}>
                {isPast ? (
                  <CheckCircle className="h-3 w-3" />
                ) : isCurrent ? (
                  <Play className="h-3 w-3" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {index < sortedDepts.length - 1 && (
                <div className={`
                  w-3 h-0.5 transition-all
                  ${isPast ? 'bg-green-400' : 'bg-gray-300'}
                `}></div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="text-xs text-muted-foreground">
        Current: {departments.find(d => d.code === project.currentDepartment)?.name || project.currentDepartment.replace('_', ' ')}
        {project.nextDepartment && ` → Next: ${departments.find(d => d.code === project.nextDepartment)?.name || project.nextDepartment.replace('_', ' ')}`}
      </div>
    </div>
  );
}

export function ProjectMetricsGrid({ project }: ProgressIndicatorsProps) {
  const now = new Date();
  const startDate = new Date(project.startDate);
  const targetDate = new Date(project.targetDate);
  const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, totalDays - daysPassed);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all">
        <div className="text-2xl font-bold text-blue-700 mb-1">{daysPassed}</div>
        <div className="text-sm font-medium text-blue-600">Days Passed</div>
      </div>
      <div className={`text-center p-4 rounded-xl border hover:shadow-md transition-all ${
        daysLeft <= 3 ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' :
        daysLeft <= 7 ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200' :
        'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
      }`}>
        <div className={`text-2xl font-bold mb-1 ${
          daysLeft <= 3 ? 'text-red-700' :
          daysLeft <= 7 ? 'text-orange-700' :
          'text-green-700'
        }`}>{daysLeft}</div>
        <div className={`text-sm font-medium ${
          daysLeft <= 3 ? 'text-red-600' :
          daysLeft <= 7 ? 'text-orange-600' :
          'text-green-600'
        }`}>Days Left</div>
      </div>
      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all">
        <div className="text-2xl font-bold text-purple-700 mb-1">{project._count?.tasks || 0}</div>
        <div className="text-sm font-medium text-purple-600">Tasks</div>
      </div>
      <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 hover:shadow-md transition-all">
        <div className="text-2xl font-bold text-amber-700 mb-1">{project._count?.comments || 0}</div>
        <div className="text-sm font-medium text-amber-600">Comments</div>
      </div>
    </div>
  );
}

export default {
  ProjectHealthScore,
  ProjectHealthIndicators,
  DepartmentProgressBar,
  MiniTimeline,
  ProjectMetricsGrid
};