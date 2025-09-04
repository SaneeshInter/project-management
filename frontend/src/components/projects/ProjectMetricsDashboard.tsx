import { 
  BarChart3, Clock, TrendingUp, AlertTriangle, 
  CheckCircle, Users, Calendar, Target,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, DepartmentMaster } from '@/types';
import { formatDate } from '@/lib/utils';

interface ProjectMetricsDashboardProps {
  project: Project;
  departments?: DepartmentMaster[];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const MetricCard = ({ 
  title, value, subtitle, icon: Icon, color, bgColor, borderColor, trend, trendValue 
}: MetricCardProps) => (
  <Card className={`${bgColor} border-2 ${borderColor} hover:shadow-lg transition-all duration-200`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color === 'text-white' ? 'bg-gray-800' : 'bg-white/50'}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {trend === 'up' && <ArrowUp className="h-3 w-3" />}
            {trend === 'down' && <ArrowDown className="h-3 w-3" />}
            {trend === 'neutral' && <Minus className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${color}`}>{value}</span>
        </div>
        <div className={`text-sm font-medium ${color} opacity-80`}>{title}</div>
        {subtitle && (
          <div className={`text-xs ${color} opacity-60`}>{subtitle}</div>
        )}
      </div>
    </CardContent>
  </Card>
);

const ProjectHealthMeter = ({ project }: { project: Project }) => {
  const calculateHealth = (): { score: number; label: string; color: string; bgColor: string } => {
    let score = 100;
    const now = new Date();
    const targetDate = new Date(project.targetDate);
    const isOverdue = targetDate < now;
    const daysUntilTarget = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (isOverdue) score -= 40;
    else if (daysUntilTarget <= 3) score -= 20;
    else if (daysUntilTarget <= 7) score -= 10;
    
    if (project.status === 'HOLD') score -= 25;
    if (project.dependency) score -= 15;
    if (project.deviationReason) score -= 20;
    if (project.status === 'COMPLETED') score = 100;
    
    score = Math.max(0, Math.min(100, score));
    
    if (score >= 85) return { score, label: 'Excellent', color: 'text-green-700', bgColor: 'from-green-500 to-green-600' };
    if (score >= 70) return { score, label: 'Good', color: 'text-blue-700', bgColor: 'from-blue-500 to-blue-600' };
    if (score >= 50) return { score, label: 'At Risk', color: 'text-yellow-700', bgColor: 'from-yellow-500 to-orange-500' };
    return { score, label: 'Critical', color: 'text-red-700', bgColor: 'from-red-500 to-red-600' };
  };

  const health = calculateHealth();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (health.score / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <svg className="transform -rotate-90" width="120" height="120">
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="url(#healthGradient)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`stop-color-${health.bgColor.split(' ')[0]?.split('-')[1] || 'gray'}-500`} />
              <stop offset="100%" className={`stop-color-${health.bgColor.split(' ')[2]?.split('-')[1] || 'gray'}-600`} />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${health.color}`}>{health.score}</div>
            <div className="text-xs font-medium text-gray-600">{health.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProjectMetricsDashboard({ project }: ProjectMetricsDashboardProps) {
  const now = new Date();
  const startDate = new Date(project.startDate);
  const targetDate = new Date(project.targetDate);
  const totalDays = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, totalDays - daysPassed);
  
  // Department progress calculation
  const departmentOrder = ['PMO', 'DESIGN', 'HTML', 'PHP', 'REACT', 'WORDPRESS', 'QA', 'DELIVERY'];
  const currentDeptIndex = departmentOrder.indexOf(project.currentDepartment);
  const departmentProgress = ((currentDeptIndex + 1) / departmentOrder.length) * 100;
  
  // Timeline progress
  const timelineProgress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
  
  const isOverdue = daysLeft === 0 && now > targetDate;
  
  const metrics: Omit<MetricCardProps, 'trend' | 'trendValue'>[] = [
    {
      title: 'Current Department',
      value: project.currentDepartment.replace('_', ' '),
      subtitle: 'Active Phase',
      icon: TrendingUp,
      color: 'text-blue-700',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Next Department', 
      value: project.nextDepartment ? project.nextDepartment.replace('_', ' ') : 'Final',
      subtitle: 'Upcoming Phase',
      icon: ArrowUp,
      color: 'text-purple-700',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100', 
      borderColor: 'border-purple-200'
    },
    {
      title: 'Target Date',
      value: formatDate(project.targetDate),
      subtitle: isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`,
      icon: Calendar,
      color: isOverdue ? 'text-red-700' : daysLeft <= 7 ? 'text-orange-700' : 'text-green-700',
      bgColor: isOverdue ? 'bg-gradient-to-br from-red-50 to-red-100' : 
               daysLeft <= 7 ? 'bg-gradient-to-br from-orange-50 to-orange-100' :
               'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: isOverdue ? 'border-red-200' : 
                   daysLeft <= 7 ? 'border-orange-200' : 
                   'border-green-200'
    },
    {
      title: 'Completion',
      value: `${Math.round(departmentProgress)}%`,
      subtitle: 'Department Progress',
      icon: Target,
      color: 'text-indigo-700',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      borderColor: 'border-indigo-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Detailed Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Project Health */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-gray-700" />
              Project Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectHealthMeter project={project} />
            <div className="mt-4 space-y-2">
              {project.dependency && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  Has Dependencies
                </div>
              )}
              {project.deviationReason && (
                <div className="flex items-center gap-2 text-sm text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  Timeline Deviation
                </div>
              )}
              {project.status === 'COMPLETED' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Project Completed
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Overview */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-gray-700" />
              Timeline Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Timeline Progress</span>
                <span className="text-sm text-gray-600">{Math.round(timelineProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    timelineProgress > 90 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                    'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${timelineProgress}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{daysPassed}</div>
                <div className="text-xs text-gray-600">Days Elapsed</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                  {isOverdue ? 'OVERDUE' : daysLeft}
                </div>
                <div className="text-xs text-gray-600">
                  {isOverdue ? 'Days' : 'Days Remaining'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team & Activity */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-gray-700" />
              Team & Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Project Owner</span>
                <Badge variant="outline">{project.owner.name}</Badge>
              </div>
              
              {project.projectCoordinator && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Coordinator</span>
                  <Badge variant="outline">{project.projectCoordinator.name}</Badge>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{project._count?.tasks || 0}</div>
                <div className="text-xs text-gray-600">Active Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-600">{project._count?.comments || 0}</div>
                <div className="text-xs text-gray-600">Comments</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Alerts & Notifications */}
      {(project.dependency || project.deviationReason || project.observations) && (
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Important Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.dependency && (
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-orange-800">Project Dependencies</div>
                  <div className="text-sm text-orange-700">This project has external dependencies that may affect timeline</div>
                </div>
              </div>
            )}
            
            {project.deviationReason && (
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                <Clock className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-yellow-800">Timeline Deviation</div>
                  <div className="text-sm text-yellow-700">{project.deviationReason}</div>
                </div>
              </div>
            )}
            
            {project.observations && (
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-blue-800">Project Notes</div>
                  <div className="text-sm text-blue-700">{project.observations}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}