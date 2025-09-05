import { 
  Calendar, 
  AlertTriangle, 
  Building2, 
  User, 
  FileText,
  Target,
  TrendingUp,
  Briefcase,
  MapPin,
  CheckCircle2,
  Timer,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, DepartmentMaster, Department } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { departmentsApi } from '@/lib/api';

interface ProjectOverviewHeroProps {
  project: Project;
  departments?: DepartmentMaster[];
}

const getTimeStatus = (targetDate: string): { 
  status: 'overdue' | 'urgent' | 'warning' | 'normal';
  daysText: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
} => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      status: 'overdue',
      daysText: `${Math.abs(diffDays)} days overdue`,
      color: 'text-red-700',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-300',
      iconBg: 'bg-red-600'
    };
  } else if (diffDays <= 3) {
    return {
      status: 'urgent',
      daysText: `${diffDays} days remaining`,
      color: 'text-orange-700',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-orange-300',
      iconBg: 'bg-orange-600'
    };
  } else if (diffDays <= 7) {
    return {
      status: 'warning',
      daysText: `${diffDays} days remaining`,
      color: 'text-yellow-700',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-300',
      iconBg: 'bg-yellow-600'
    };
  } else {
    return {
      status: 'normal',
      daysText: `${diffDays} days remaining`,
      color: 'text-green-700',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-300',
      iconBg: 'bg-green-600'
    };
  }
};

const getDepartmentIcon = (department: Department) => {
  switch (department) {
    case Department.PMO:
      return <Briefcase className="w-4 h-4" />;
    case Department.DESIGN:
      return <Target className="w-4 h-4" />;
    case Department.HTML:
    case Department.PHP:
    case Department.REACT:
    case Department.WORDPRESS:
      return <FileText className="w-4 h-4" />;
    case Department.QA:
      return <CheckCircle2 className="w-4 h-4" />;
    case Department.DELIVERY:
      return <TrendingUp className="w-4 h-4" />;
    case Department.MANAGER:
      return <Users className="w-4 h-4" />;
    default:
      return <Building2 className="w-4 h-4" />;
  }
};

const formatDepartmentName = (dept: string): string => {
  return dept.replace('_', ' ').split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

const calculateProjectProgress = (project: Project, mainDepartments: DepartmentMaster[]): number => {
  if (project.status === 'COMPLETED') return 100;
  if (project.status === 'HOLD') return 0;
  
  if (!mainDepartments || mainDepartments.length === 0) return 0;
  
  // Find the current department position in the main departments list
  const currentDepartmentIndex = mainDepartments.findIndex(
    dept => dept.code === project.currentDepartment
  );
  
  if (currentDepartmentIndex === -1) return 0;
  
  // Calculate progress based on department progression
  const progressPerDepartment = 100 / mainDepartments.length;
  const currentProgress = (currentDepartmentIndex + 1) * progressPerDepartment;
  
  return Math.round(Math.min(currentProgress, 95)); // Cap at 95% until marked as complete
};

export default function ProjectOverviewHero({ project }: ProjectOverviewHeroProps) {
  const [mainDepartments, setMainDepartments] = useState<DepartmentMaster[]>([]);
  const timeStatus = getTimeStatus(project.targetDate);
  
  useEffect(() => {
    const fetchMainDepartments = async () => {
      try {
        const departments = await departmentsApi.getMainDepartments();
        setMainDepartments(departments);
      } catch (error) {
        console.error('Error fetching main departments:', error);
      }
    };

    fetchMainDepartments();
  }, []);

  const progress = calculateProjectProgress(project, mainDepartments);
  
  return (
    <div className="space-y-6">
      {/* Hero Section with Enhanced Visual Design */}
      <Card className={`relative overflow-hidden border-2 shadow-lg ${timeStatus.borderColor}`}>
        <div className={`${timeStatus.bgColor} relative`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
          </div>
          
          <CardContent className="relative p-8">
            {/* Top Row: Status and Target Date */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl shadow-lg ${timeStatus.iconBg}`}>
                  {timeStatus.status === 'overdue' ? (
                    <AlertTriangle className="h-10 w-10 text-white" />
                  ) : (
                    <Calendar className="h-10 w-10 text-white" />
                  )}
                </div>
                <div>
                  <h2 className={`text-4xl font-bold ${timeStatus.color} mb-1`}>
                    {formatDate(project.targetDate)}
                  </h2>
                  <p className={`text-lg font-semibold ${timeStatus.color}`}>
                    {timeStatus.daysText}
                  </p>
                  <p className="text-sm text-gray-600">Target Completion Date</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge 
                  className={getStatusColor(project.status) + ' text-lg px-4 py-2 font-semibold shadow-sm'}
                >
                  {project.status}
                </Badge>
                <Badge 
                  variant={timeStatus.status === 'overdue' ? 'destructive' : 'outline'}
                  className={`text-base px-3 py-2 font-medium border-2 ${timeStatus.status !== 'overdue' ? timeStatus.color + ' ' + timeStatus.borderColor : ''}`}
                >
                  {timeStatus.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Project Progress</span>
                <span className="text-sm font-bold text-gray-900">{progress}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-60 rounded-full h-3 shadow-inner">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 shadow-sm ${
                    progress >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    progress >= 60 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    progress >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Department */}
              <div className="bg-white bg-opacity-60 rounded-xl p-4 border border-white border-opacity-50 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getDepartmentIcon(project.currentDepartment)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Current Department</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDepartmentName(project.currentDepartment)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Category */}
              <div className="bg-white bg-opacity-60 rounded-xl p-4 border border-white border-opacity-50 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Category</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {project.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* Creation Date */}
              <div className="bg-white bg-opacity-60 rounded-xl p-4 border border-white border-opacity-50 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Timer className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Started</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(project.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Information */}
            {project.clientName && (
              <div className="mt-6">
                <div className="bg-white bg-opacity-60 rounded-xl p-4 border border-white border-opacity-50 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Client</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {project.clientName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Status Indicators */}
            <div className="flex flex-wrap gap-2 mt-6">
              {project.departmentHistory && project.departmentHistory.length > 1 && (
                <Badge variant="outline" className="bg-white bg-opacity-60 border-blue-300 text-blue-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {project.departmentHistory.length} Departments Visited
                </Badge>
              )}
              {project.projectCode && (
                <Badge variant="outline" className="bg-white bg-opacity-60 border-gray-300 text-gray-800">
                  <FileText className="w-3 h-3 mr-1" />
                  {project.projectCode}
                </Badge>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}