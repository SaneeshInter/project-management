import { useState } from 'react';
import { User, Mail, Building2, Calendar, Edit, Trash2, UserPlus, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Employee, Role } from '@/types';
import { employeeUtils, departmentUtils } from '@/lib/employeeUtils';

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onAssignProject?: (employee: Employee) => void;
  onViewDetails?: (employee: Employee) => void;
}

export default function EmployeeCard({
  employee,
  onEdit,
  onDelete,
  onAssignProject,
  onViewDetails
}: EmployeeCardProps) {
  const [showActions, setShowActions] = useState(false);
  
  const workload = employeeUtils.calculateWorkload(employee);

  const formatRole = (role: Role): string => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const getWorkloadColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Quick Actions Overlay */}
      {showActions && (
        <div className="absolute top-2 right-2 flex gap-1 z-10 bg-white/80 backdrop-blur-sm rounded-lg p-1">
          {onViewDetails && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => onViewDetails(employee)}
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}
          {onEdit && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => onEdit(employee)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          {onAssignProject && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => onAssignProject(employee)}
            >
              <UserPlus className="h-3 w-3" />
            </Button>
          )}
          {onDelete && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
              onClick={() => onDelete(employee)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            {employee.avatar ? (
              <img 
                src={employee.avatar} 
                alt={employee.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-foreground font-medium text-lg">
                {getInitials(employee.name)}
              </span>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{employee.name}</h3>
              <Badge className={employeeUtils.getStatusColor(employee.status)}>
                {employee.status}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span className="truncate">{employee.email}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>{formatRole(employee.role)}</span>
              </div>
              
              {employee.department && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  <span>{departmentUtils.formatDepartmentName(employee.department)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Work Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Weekly Limit</div>
            <div className="font-medium">
              {employee.weeklyLimit ? `${employee.weeklyLimit}h` : 'Not set'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Daily Limit</div>
            <div className="font-medium">
              {employee.dailyLimit ? `${employee.dailyLimit}h` : 'Not set'}
            </div>
          </div>
        </div>

        {/* Project Workload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Project Workload</span>
            <span className="text-muted-foreground">
              {workload.projectCount} projects
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getWorkloadColor(workload.utilizationPercentage)}`}
              style={{ width: `${Math.min(workload.utilizationPercentage, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(workload.utilizationPercentage)}% utilized</span>
            {workload.isOverloaded && (
              <Badge variant="destructive" className="text-xs">
                Overloaded
              </Badge>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {employee.trackingEnabled && (
            <Badge variant="outline" className="text-xs">
              Tracking
            </Badge>
          )}
          {employee.timesheetsEnabled && (
            <Badge variant="outline" className="text-xs">
              Timesheets
            </Badge>
          )}
          {employee.countsTowardPricing && (
            <Badge variant="outline" className="text-xs">
              Billable
            </Badge>
          )}
        </div>

        {/* Recent Projects */}
        {employee.projectAssignments && employee.projectAssignments.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Recent Projects</div>
            <div className="space-y-1">
              {employee.projectAssignments.slice(0, 2).map((assignment) => (
                <div 
                  key={assignment.id}
                  className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
                >
                  <span className="font-medium truncate">
                    {assignment.project?.name || 'Unknown Project'}
                  </span>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                  >
                    {assignment.status}
                  </Badge>
                </div>
              ))}
              {employee.projectAssignments.length > 2 && (
                <div className="text-xs text-center text-muted-foreground">
                  +{employee.projectAssignments.length - 2} more projects
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Added {formatDate(employee.dateAdded || employee.createdAt)}</span>
          </div>
          {employee.projectAssignments && (
            <div className="flex items-center gap-1">
              <span>{employee.projectAssignments.filter(a => a.status === 'ACTIVE').length} active</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}