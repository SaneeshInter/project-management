import { Calendar, Clock, TrendingUp, ArrowRight, Target, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, Department, DepartmentMaster } from '@/types';
import { formatDate } from '@/lib/utils';

interface ProjectOverviewHeroProps {
  project: Project;
  departments?: DepartmentMaster[];
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

const getDepartmentProgress = (currentDept: Department, departments: DepartmentMaster[] = []): number => {
  const rootDepartments = departments.filter(d => !d.parentId);
  const sortedDepts = rootDepartments.length > 0 ? rootDepartments : 
    departmentOrder.map((code, index) => ({ code, name: code.replace('_', ' '), id: index.toString() }));
  
  const currentIndex = sortedDepts.findIndex(d => d.code === currentDept);
  return currentIndex !== -1 ? ((currentIndex + 1) / sortedDepts.length) * 100 : 0;
};

const getTimeStatus = (targetDate: string): { 
  status: 'overdue' | 'urgent' | 'warning' | 'normal';
  daysText: string;
  color: string;
  bgColor: string;
  borderColor: string;
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
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    };
  } else if (diffDays <= 3) {
    return {
      status: 'urgent',
      daysText: `${diffDays} days left`,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    };
  } else if (diffDays <= 7) {
    return {
      status: 'warning',
      daysText: `${diffDays} days left`,
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    };
  } else {
    return {
      status: 'normal',
      daysText: `${diffDays} days left`,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
  }
};

const CircularProgress = ({ percentage, size = 120 }: { percentage: number; size?: number }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        className="transform -rotate-90" 
        width={size} 
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-blue-600 transition-all duration-700 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</div>
          <div className="text-xs text-gray-500 font-medium">Complete</div>
        </div>
      </div>
    </div>
  );
};

export default function ProjectOverviewHero({ project, departments = [] }: ProjectOverviewHeroProps) {
  const progress = getDepartmentProgress(project.currentDepartment, departments);
  const timeStatus = getTimeStatus(project.targetDate);
  
  // Calculate overall project timeline progress
  const startDate = new Date(project.startDate);
  const targetDate = new Date(project.targetDate);
  const currentDate = new Date();
  const totalDuration = targetDate.getTime() - startDate.getTime();
  const elapsed = currentDate.getTime() - startDate.getTime();
  const timelineProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  return (
    <div className="space-y-6">
      {/* Hero Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {/* Current Department */}
        <Card className="relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <Badge variant="default" className="bg-blue-600 text-white">
                CURRENT
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-blue-900">
                {project.currentDepartment.replace('_', ' ')}
              </h3>
              <p className="text-sm text-blue-700">Active Department</p>
            </div>
          </CardContent>
        </Card>

        {/* Next Department */}
        <Card className="relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
              <Badge variant="outline" className="border-purple-400 text-purple-700">
                NEXT
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-purple-900">
                {project.nextDepartment ? project.nextDepartment.replace('_', ' ') : 'Final Stage'}
              </h3>
              <p className="text-sm text-purple-700">Upcoming Department</p>
            </div>
          </CardContent>
        </Card>

        {/* Target Date */}
        <Card className={`relative overflow-hidden border-2 ${timeStatus.borderColor} ${timeStatus.bgColor}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${timeStatus.status === 'overdue' ? 'bg-red-600' : timeStatus.status === 'urgent' ? 'bg-orange-600' : timeStatus.status === 'warning' ? 'bg-yellow-600' : 'bg-green-600'}`}>
                {timeStatus.status === 'overdue' ? (
                  <AlertTriangle className="h-5 w-5 text-white" />
                ) : (
                  <Calendar className="h-5 w-5 text-white" />
                )}
              </div>
              <Badge 
                variant={timeStatus.status === 'overdue' ? 'destructive' : 'outline'}
                className={timeStatus.status !== 'overdue' ? timeStatus.color : ''}
              >
                {timeStatus.status.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className={`text-lg font-bold ${timeStatus.color}`}>
                {formatDate(project.targetDate)}
              </h3>
              <p className={`text-sm ${timeStatus.color}`}>
                {timeStatus.daysText}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Completion Percentage */}
        <Card className="relative overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <Badge variant="outline" className="border-green-400 text-green-700">
                PROGRESS
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-green-900">
                {Math.round(progress)}%
              </h3>
              <p className="text-sm text-green-700">Department Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Visualization */}
      <Card className="border-2 border-gray-100">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Circular Progress */}
            <div className="flex flex-col items-center space-y-4">
              <CircularProgress percentage={progress} />
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">Department Progress</h4>
                <p className="text-sm text-gray-600">
                  {departmentOrder.indexOf(project.currentDepartment) + 1} of {departmentOrder.length} departments
                </p>
              </div>
            </div>

            {/* Department Timeline */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Workflow Pipeline
              </h4>
              
              <div className="flex items-center justify-between space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                {departmentOrder.map((dept, index) => {
                  const isCurrent = dept === project.currentDepartment;
                  const isPast = departmentOrder.indexOf(project.currentDepartment) > index;
                  const isNext = dept === project.nextDepartment;
                  
                  return (
                    <div key={dept} className="flex items-center flex-shrink-0">
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`
                          w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-3 transition-all duration-300
                          ${isPast ? 'bg-green-500 border-green-500 text-white shadow-lg' :
                            isCurrent ? 'bg-blue-500 border-blue-500 text-white shadow-xl animate-pulse' :
                            isNext ? 'bg-orange-400 border-orange-400 text-white shadow-md' :
                            'bg-gray-200 border-gray-300 text-gray-600'}
                        `}>
                          {isPast ? '✓' : index + 1}
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-xs font-medium ${
                            isCurrent ? 'text-blue-700' : 
                            isPast ? 'text-green-700' :
                            isNext ? 'text-orange-700' :
                            'text-gray-500'
                          }`}>
                            {dept.replace('_', ' ')}
                          </div>
                          {isCurrent && (
                            <div className="text-xs text-blue-600 font-bold mt-1">ACTIVE</div>
                          )}
                          {isNext && (
                            <div className="text-xs text-orange-600 font-bold mt-1">NEXT</div>
                          )}
                        </div>
                      </div>
                      
                      {index < departmentOrder.length - 1 && (
                        <div className={`
                          w-8 h-1 mx-2 rounded transition-all duration-300
                          ${isPast ? 'bg-green-400' : 'bg-gray-300'}
                        `} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Timeline Progress */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(timelineProgress)}%</div>
            <div className="text-xs text-gray-600 font-medium">Timeline Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${timelineProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Days Passed */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{project.monthsPassed}</div>
            <div className="text-xs text-gray-600 font-medium">Months Passed</div>
          </CardContent>
        </Card>

        {/* Pages Count */}
        {project.pagesCount && (
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{project.pagesCount}</div>
              <div className="text-xs text-gray-600 font-medium">Total Pages</div>
            </CardContent>
          </Card>
        )}

        {/* Status Indicators */}
        <Card>
          <CardContent className="p-4 text-center space-y-2">
            <div className="flex justify-center">
              {project.dependency ? (
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              ) : (
                <Target className="h-6 w-6 text-green-500" />
              )}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {project.dependency ? 'Has Dependencies' : 'No Dependencies'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Information Bar */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">Owner:</span>
              <Badge variant="outline" className="bg-white">
                {project.owner.name}
              </Badge>
            </div>
            
            {project.projectCoordinator && (
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">PC:</span>
                <Badge variant="outline" className="bg-white">
                  {project.projectCoordinator.name}
                </Badge>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">Office:</span>
              <Badge variant="outline" className="bg-white">
                {project.office}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}