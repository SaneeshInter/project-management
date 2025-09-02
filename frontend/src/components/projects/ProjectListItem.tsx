import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, AlertTriangle, CheckCircle, 
  Play, Pause, ArrowRight, Eye, Edit
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project, Department } from '@/types';
import { formatDate } from '@/lib/utils';

interface ProjectListItemProps {
  project: Project;
  onQuickEdit?: (project: Project) => void;
  onMoveProject?: (project: Project) => void;
  onViewDetails?: (project: Project) => void;
}

const departmentOrder: Department[] = [
  Department.PMO,
  Department.DESIGN,
  Department.HTML,
  Department.PHP,
  Department.REACT,
  Department.WORDPRESS,
  Department.QA,
  Department.DELIVERY,
  Department.MANAGER
];

const departmentConfig = {
  [Department.PMO]: { icon: '📋', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  [Department.DESIGN]: { icon: '🎨', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  [Department.HTML]: { icon: '🏗️', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  [Department.PHP]: { icon: '🔧', color: 'bg-red-100 text-red-800 border-red-300' },
  [Department.REACT]: { icon: '⚛️', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  [Department.WORDPRESS]: { icon: '📝', color: 'bg-green-100 text-green-800 border-green-300' },
  [Department.QA]: { icon: '🧪', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  [Department.DELIVERY]: { icon: '🚀', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  [Department.MANAGER]: { icon: '👔', color: 'bg-slate-100 text-slate-800 border-slate-300' }
};

const getDepartmentProgress = (currentDept: Department): number => {
  const currentIndex = departmentOrder.indexOf(currentDept);
  return ((currentIndex + 1) / departmentOrder.length) * 100;
};

const getProjectHealthScore = (project: Project): { score: number; color: string; indicator: string } => {
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
  
  score = Math.max(0, Math.min(100, score));
  
  let color = 'bg-green-500';
  let indicator = '🟢';
  
  if (score < 50) {
    color = 'bg-red-500';
    indicator = '🔴';
  } else if (score < 70) {
    color = 'bg-yellow-500';
    indicator = '🟡';
  } else if (score < 85) {
    color = 'bg-blue-500';
    indicator = '🟠';
  }
  
  return { score, color, indicator };
};

const getTimeStatus = (targetDate: string): { 
  text: string; 
  color: string; 
  urgent: boolean 
} => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      text: `Overdue: ${Math.abs(diffDays)}d`,
      color: 'text-red-600 font-semibold',
      urgent: true
    };
  } else if (diffDays <= 3) {
    return {
      text: `Due: ${diffDays}d`,
      color: 'text-orange-600 font-medium',
      urgent: true
    };
  } else if (diffDays <= 7) {
    return {
      text: `Due: ${diffDays}d`,
      color: 'text-yellow-600',
      urgent: false
    };
  } else {
    return {
      text: `Due: ${diffDays}d`,
      color: 'text-gray-600',
      urgent: false
    };
  }
};

export default function ProjectListItem({
  project,
  onQuickEdit,
  onMoveProject,
  onViewDetails
}: ProjectListItemProps) {
  const [showActions, setShowActions] = useState(false);
  
  const health = getProjectHealthScore(project);
  const progress = getDepartmentProgress(project.currentDepartment);
  const timeStatus = getTimeStatus(project.targetDate);
  const deptConfig = departmentConfig[project.currentDepartment];

  return (
    <div 
      className="project-list-item flex items-center gap-4 p-4 bg-white border rounded-lg hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Health Indicator */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div 
          className={`w-3 h-3 rounded-full ${health.color} mb-1`}
          title={`Health Score: ${health.score}%`}
        ></div>
        <span className="text-xs text-gray-500">{health.score}%</span>
      </div>

      {/* Project Code & Name */}
      <div className="flex-shrink-0 min-w-0 w-64">
        <Link 
          to={`/projects/${project.id}`}
          className="block hover:underline"
        >
          <div className="flex items-center gap-2 mb-1">
            {project.projectCode && (
              <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 flex-shrink-0">
                {project.projectCode}
              </Badge>
            )}
            <h3 className="font-semibold text-sm truncate">{project.name}</h3>
          </div>
          {project.clientName && (
            <p className="text-xs text-gray-500 truncate">
              {project.clientName} • {project.office.toLowerCase().replace(/^\w/, c => c.toUpperCase())}
            </p>
          )}
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="flex-grow min-w-32 max-w-48 hide-mobile">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Department Badge */}
      <div className="flex-shrink-0">
        <Badge className={`${deptConfig.color} border flex items-center gap-1 px-2 py-1`}>
          <span className="text-sm">{deptConfig.icon}</span>
          <span className="text-xs font-medium">
            {project.currentDepartment.replace('_', ' ')}
          </span>
        </Badge>
        {project.nextDepartment && (
          <div className="flex items-center gap-1 mt-1">
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {project.nextDepartment.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Time Status */}
      <div className="flex-shrink-0 w-24 text-center hide-mobile">
        <div className={`text-xs ${timeStatus.color}`}>
          {timeStatus.text}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {formatDate(project.targetDate)}
        </div>
      </div>

      {/* PMO Assignment */}
      <div className="flex-shrink-0 flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1" title="Project Coordinator (PMO)">
          <User className="h-3 w-3" />
          <span className="max-w-20 truncate">
            PC: {project.projectCoordinator?.name || 'Not assigned'}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex-shrink-0">
        <Badge 
          variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {project.status === 'ACTIVE' && <Play className="h-3 w-3 mr-1" />}
          {project.status === 'HOLD' && <Pause className="h-3 w-3 mr-1" />}
          {project.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
          {project.status}
        </Badge>
      </div>

      {/* Owner */}
      <div className="flex-shrink-0 w-20 text-center hide-mobile">
        <div className="flex items-center justify-center gap-1">
          <User className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-600 truncate">
            {project.owner.name.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 w-24 flex justify-end">
        {showActions ? (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onViewDetails?.(project)}
              title="View Details"
            >
              <Eye className="h-3 w-3" />
            </Button>
            {onQuickEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onQuickEdit(project)}
                title="Quick Edit"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onMoveProject && project.status === 'ACTIVE' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onMoveProject(project)}
                title="Move to Next Department"
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {timeStatus.urgent && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
            {project.dependency && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Has dependencies"></div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}