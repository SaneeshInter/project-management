import { 
  BarChart3, Clock, AlertTriangle, 
  CheckCircle, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, DepartmentMaster } from '@/types';

interface ProjectMetricsDashboardProps {
  project: Project;
  departments?: DepartmentMaster[];
}



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
  

  return (
    <div className="space-y-6">

    </div>
  );
}