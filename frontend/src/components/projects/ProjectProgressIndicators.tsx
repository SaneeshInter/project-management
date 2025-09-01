import { 
  TrendingDown, Clock, AlertTriangle, 
  CheckCircle, Pause, Play, Target,
  Users, MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Project, Department } from '@/types';

interface ProgressIndicatorsProps {
  project: Project;
}

interface ProjectHealthMetrics {
  score: number;
  indicators: {
    type: 'success' | 'warning' | 'error' | 'info';
    label: string;
    icon: React.ReactNode;
  }[];
}

const departmentOrder: Department[] = [
  Department.PMO,
  Department.DESIGN,
  Department.HTML,
  Department.PHP,
  Department.REACT,
  Department.WORDPRESS,
  Department.QA,
  Department.DELIVERY
];

const getDepartmentProgress = (currentDept: Department): number => {
  const currentIndex = departmentOrder.indexOf(currentDept);
  return ((currentIndex + 1) / departmentOrder.length) * 100;
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
    <div className={`px-3 py-2 rounded-lg border ${healthColor} text-center`}>
      <div className="text-lg font-bold">{health.score}%</div>
      <div className="text-xs opacity-75">Health Score</div>
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

export function DepartmentProgressBar({ project }: ProgressIndicatorsProps) {
  const progress = getDepartmentProgress(project.currentDepartment);
  const currentIndex = departmentOrder.indexOf(project.currentDepartment);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Department Progress</span>
        <span className="text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 relative">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
        
        {/* Department markers */}
        <div className="absolute inset-0 flex justify-between items-center px-1">
          {departmentOrder.map((dept, index) => {
            const isActive = index <= currentIndex;
            return (
              <div
                key={dept}
                className={`w-1 h-1 rounded-full ${
                  isActive ? 'bg-white' : 'bg-gray-400'
                }`}
                title={dept.replace('_', ' ')}
              />
            );
          })}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{departmentOrder[0].replace('_', ' ')}</span>
        <span className="font-medium text-blue-600">
          {project.currentDepartment.replace('_', ' ')}
        </span>
        <span>{departmentOrder[departmentOrder.length - 1].replace('_', ' ')}</span>
      </div>
    </div>
  );
}

export function MiniTimeline({ project }: ProgressIndicatorsProps) {
  const currentIndex = departmentOrder.indexOf(project.currentDepartment);
  
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Workflow Timeline</div>
      <div className="flex items-center gap-1 overflow-hidden">
        {departmentOrder.map((dept, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isNext = dept === project.nextDepartment;
          
          return (
            <div key={dept} className="flex items-center flex-shrink-0">
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
              
              {index < departmentOrder.length - 1 && (
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
        Current: {project.currentDepartment.replace('_', ' ')}
        {project.nextDepartment && ` → Next: ${project.nextDepartment.replace('_', ' ')}`}
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
  
  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div className="text-center p-2 bg-blue-50 rounded">
        <div className="font-bold text-blue-600">{daysPassed}</div>
        <div className="text-blue-600">Days Passed</div>
      </div>
      <div className="text-center p-2 bg-green-50 rounded">
        <div className="font-bold text-green-600">{Math.max(0, totalDays - daysPassed)}</div>
        <div className="text-green-600">Days Left</div>
      </div>
      <div className="text-center p-2 bg-purple-50 rounded">
        <div className="font-bold text-purple-600">{project._count?.tasks || 0}</div>
        <div className="text-purple-600">Tasks</div>
      </div>
      <div className="text-center p-2 bg-orange-50 rounded">
        <div className="font-bold text-orange-600">{project._count?.comments || 0}</div>
        <div className="text-orange-600">Comments</div>
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