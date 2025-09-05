import { Link } from 'react-router-dom';
import { 
  Clock, User, AlertTriangle, 
  Pause, ArrowRight, TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, Department } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';

interface EnhancedProjectCardProps {
  project: Project;
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

const getProjectHealthScore = (project: Project): { score: number; color: string; label: string } => {
  let score = 100;
  const now = new Date();
  const targetDate = new Date(project.targetDate);
  const isOverdue = targetDate < now;
  const daysUntilTarget = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Deduct points for being overdue
  if (isOverdue) score -= 30;
  else if (daysUntilTarget <= 3) score -= 15;
  else if (daysUntilTarget <= 7) score -= 10;
  
  // Deduct points for dependency issues
  if (project.dependency) score -= 10;
  
  // Deduct points for being on hold
  if (project.status === 'HOLD') score -= 20;
  
  // Bonus for completed status
  if (project.status === 'COMPLETED') score = Math.max(score + 10, 100);
  
  score = Math.max(0, Math.min(100, score));
  
  let color = 'text-green-600';
  let label = 'Healthy';
  
  if (score < 50) {
    color = 'text-red-600';
    label = 'Critical';
  } else if (score < 70) {
    color = 'text-yellow-600';
    label = 'At Risk';
  } else if (score < 85) {
    color = 'text-blue-600';
    label = 'Good';
  }
  
  return { score, color, label };
};

const getTimeStatus = (targetDate: string): { 
  status: 'overdue' | 'urgent' | 'warning' | 'normal';
  daysText: string;
  color: string;
} => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      status: 'overdue',
      daysText: `${Math.abs(diffDays)} days overdue`,
      color: 'text-red-600 bg-red-50 border-red-200'
    };
  } else if (diffDays <= 3) {
    return {
      status: 'urgent',
      daysText: `${diffDays} days left`,
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    };
  } else if (diffDays <= 7) {
    return {
      status: 'warning',
      daysText: `${diffDays} days left`,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    };
  } else {
    return {
      status: 'normal',
      daysText: `${diffDays} days left`,
      color: 'text-gray-600 bg-gray-50 border-gray-200'
    };
  }
};

export default function EnhancedProjectCard({ 
  project
}: EnhancedProjectCardProps) {
  const health = getProjectHealthScore(project);
  const timeStatus = getTimeStatus(project.targetDate);
  const progress = getDepartmentProgress(project.currentDepartment);

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 relative group"
    >

      <CardHeader className="pb-3">
        {/* Header Row 1: Project Name & Status */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link 
              to={`/projects/${project.id}`}
              className="hover:underline"
            >
              <div className="flex items-center gap-2 mb-1">
                {project.projectCode && (
                  <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700">
                    {project.projectCode}
                  </Badge>
                )}
                <h3 className="font-semibold text-lg leading-tight">{project.name}</h3>
              </div>
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{project.office.toLowerCase().replace(/^\w/, c => c.toUpperCase())}</span>
              <span>•</span>
              <span>{project.category.replace('_', ' ')}</span>
              {project.clientName && (
                <>
                  <span>•</span>
                  <span className="text-blue-600">{project.clientName}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <div className={`text-xs px-2 py-1 rounded border ${health.color} font-medium`}>
              {health.score}% {health.label}
            </div>
          </div>
        </div>

        {/* Header Row 2: Time Status */}
        <div className={`text-sm px-3 py-2 rounded-lg border ${timeStatus.color} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{timeStatus.daysText}</span>
          </div>
          <span className="text-xs">Target: {formatDate(project.targetDate)}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Department Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Department Progress</span>
            <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Current & Next Department */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-blue-600 text-white">
                {project.currentDepartment.replace('_', ' ')}
              </Badge>
              {project.nextDepartment && (
                <>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline">
                    {project.nextDepartment.replace('_', ' ')}
                  </Badge>
                </>
              )}
            </div>
            
            {project.dependency && (
              <div className="flex items-center gap-1 text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs font-medium">Dependency</span>
              </div>
            )}
          </div>
        </div>


        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600 truncate max-w-20">
                {project.projectCoordinator?.name || 'Not assigned'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">PC (PMO)</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <User className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-600 truncate max-w-16">
                {project.owner.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Owner</p>
          </div>
        </div>

        {/* Observations */}
        {project.observations && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">
              <span className="font-medium">Notes:</span> {project.observations}
            </p>
          </div>
        )}

        {/* Alert Indicators */}
        <div className="flex gap-2 flex-wrap">
          {timeStatus.status === 'overdue' && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Overdue
            </Badge>
          )}
          {project.deviationReason && (
            <Badge variant="secondary" className="text-xs">
              <TrendingDown className="h-3 w-3 mr-1" />
              Deviation
            </Badge>
          )}
          {project.status === 'HOLD' && (
            <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-700">
              <Pause className="h-3 w-3 mr-1" />
              On Hold
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}