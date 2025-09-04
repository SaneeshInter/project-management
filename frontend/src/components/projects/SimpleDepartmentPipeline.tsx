import { useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project, Department, DepartmentMaster } from '@/types';
import { departmentsApi } from '@/lib/api';

interface SimpleDepartmentPipelineProps {
  projects: Project[];
  onDepartmentClick?: (department: Department) => void;
  className?: string;
}

const getDepartmentConfig = (code: string, name: string) => {
  const configs = {
    'PMO': { icon: '📋', color: 'bg-blue-500' },
    'DESIGN': { icon: '🎨', color: 'bg-purple-500' },
    'HTML': { icon: '🏗️', color: 'bg-orange-500' },
    'PHP': { icon: '🔧', color: 'bg-red-500' },
    'REACT': { icon: '⚛️', color: 'bg-cyan-500' },
    'WORDPRESS': { icon: '📝', color: 'bg-green-500' },
    'QA': { icon: '🧪', color: 'bg-yellow-500' },
    'DELIVERY': { icon: '🚀', color: 'bg-emerald-500' },
    'MANAGER': { icon: '👔', color: 'bg-slate-500' },
    'DEV': { icon: '💻', color: 'bg-indigo-500' },
    'APP': { icon: '📱', color: 'bg-teal-500' }
  };
  
  return {
    icon: configs[code as keyof typeof configs]?.icon || '🏢',
    color: configs[code as keyof typeof configs]?.color || 'bg-gray-500',
    name: name
  };
};

export default function SimpleDepartmentPipeline({
  projects,
  onDepartmentClick,
  className = ''
}: SimpleDepartmentPipelineProps) {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [departments, setDepartments] = useState<DepartmentMaster[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch departments from master data
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentData = await departmentsApi.getAll();
        setDepartments(departmentData);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Calculate department stats using master data
  const departmentStats = departments.map(departmentMaster => {
    const department = departmentMaster.code as Department;
    const deptProjects = projects.filter(p => p.currentDepartment === department && p.status === 'ACTIVE');
    const overdueProjects = deptProjects.filter(p => new Date(p.targetDate) < new Date());
    const hasBottleneck = deptProjects.length > 5 || overdueProjects.length > 2;
    
    return {
      department,
      departmentMaster,
      count: deptProjects.length,
      overdue: overdueProjects.length,
      hasBottleneck,
      projects: deptProjects.slice(0, 3) // Show max 3 projects
    };
  });

  const totalProjects = departmentStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalOverdue = departmentStats.reduce((sum, stat) => sum + stat.overdue, 0);
  const bottleneckCount = departmentStats.filter(stat => stat.hasBottleneck).length;

  const handleDepartmentClick = (department: Department) => {
    const newSelected = selectedDept === department ? null : department;
    setSelectedDept(newSelected);
    if (newSelected) {
      onDepartmentClick?.(department);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Loading departments...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">🏗️ Project Pipeline</span>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {totalProjects} Active Projects
            </Badge>
          </div>
          {/* Summary Stats */}
          <div className="flex items-center gap-3 text-sm">
            {totalOverdue > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {totalOverdue} Overdue
              </Badge>
            )}
            {bottleneckCount > 0 && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                {bottleneckCount} Bottleneck{bottleneckCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Simple Pipeline Flow - Horizontal Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {departmentStats.map((stat) => {
            const config = getDepartmentConfig(stat.departmentMaster.code, stat.departmentMaster.name);
            const isSelected = selectedDept === stat.department;
            
            return (
              <div
                key={stat.departmentMaster.id}
                className={`
                  relative cursor-pointer transition-all duration-200 p-4 rounded-lg border
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : stat.count > 0 
                    ? 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                    : 'border-gray-200 opacity-50'
                  }
                `}
                onClick={() => stat.count > 0 && handleDepartmentClick(stat.department)}
              >
                {/* Horizontal layout within each card */}
                <div className="flex items-center gap-3">
                  {/* Left: Icon */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0
                    ${config.color} ${stat.count === 0 ? 'opacity-50' : ''}
                  `}>
                    <span className="text-lg">{config.icon}</span>
                  </div>
                  
                  {/* Right: Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{config.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {stat.count} project{stat.count !== 1 ? 's' : ''}
                      </span>
                      <div className={`text-lg font-bold ${stat.count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                        {stat.count}
                      </div>
                    </div>
                    
                    {/* Status indicators */}
                    <div className="flex items-center gap-2 mt-1">
                      {stat.overdue > 0 && (
                        <span className="text-xs text-red-600 font-medium">
                          {stat.overdue} overdue
                        </span>
                      )}
                      {stat.hasBottleneck && stat.count > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-orange-600">Bottleneck</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Capacity bar at bottom */}
                {stat.count > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                      <span>Load</span>
                      <span>{stat.count}/8</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all ${
                          stat.count >= 6 ? 'bg-red-500' : 
                          stat.count >= 4 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((stat.count / 8) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <ChevronDown className="h-4 w-4 text-blue-500 transform rotate-180" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Department Details */}
        {selectedDept && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                {(() => {
                  const selectedDeptMaster = departments.find(d => d.code === selectedDept);
                  const config = selectedDeptMaster ? getDepartmentConfig(selectedDeptMaster.code, selectedDeptMaster.name) : null;
                  return (
                    <>
                      <span className="text-lg">{config?.icon || '🏢'}</span>
                      {config?.name || selectedDept} Department
                    </>
                  );
                })()}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDept(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronDown className="h-4 w-4 transform rotate-180" />
              </Button>
            </div>
            
            {(() => {
              const deptStat = departmentStats.find(s => s.department === selectedDept);
              if (!deptStat || deptStat.count === 0) {
                return (
                  <p className="text-center text-gray-500 py-4">
                    No active projects in this department
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {/* Department Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span><strong>{deptStat.count}</strong> active projects</span>
                      {deptStat.overdue > 0 && (
                        <span className="text-red-600">
                          <strong>{deptStat.overdue}</strong> overdue
                        </span>
                      )}
                    </div>
                    {deptStat.hasBottleneck && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Bottleneck
                      </Badge>
                    )}
                  </div>

                  {/* Sample Projects */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Recent Projects:
                    </h5>
                    {deptStat.projects.map((project) => {
                      const isOverdue = new Date(project.targetDate) < new Date();
                      
                      return (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-3 bg-white border rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-sm">{project.name}</div>
                            {project.clientName && (
                              <div className="text-xs text-gray-500">{project.clientName}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                            <div className="text-xs text-gray-500">
                              Due: {new Date(project.targetDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {deptStat.count > 3 && (
                      <div className="text-center">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                          View all {deptStat.count} projects →
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}