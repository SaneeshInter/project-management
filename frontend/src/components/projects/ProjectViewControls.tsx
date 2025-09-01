import { Grid, List, Kanban, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProjectViewControlsProps {
  viewMode: 'grid' | 'list';
  groupBy: 'department' | 'status' | 'health' | 'dueDate' | 'none';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onGroupByChange: (groupBy: 'department' | 'status' | 'health' | 'dueDate' | 'none') => void;
}

const groupOptions = [
  { value: 'department', label: 'Department', icon: '🏢', description: 'Group by current department' },
  { value: 'status', label: 'Status', icon: '📊', description: 'Group by project status' },
  { value: 'health', label: 'Health', icon: '❤️', description: 'Group by health score' },
  { value: 'dueDate', label: 'Due Date', icon: '📅', description: 'Group by due date proximity' },
  { value: 'none', label: 'No Grouping', icon: '📄', description: 'Show all projects in one list' }
];

export default function ProjectViewControls({
  viewMode,
  groupBy,
  onViewModeChange,
  onGroupByChange
}: ProjectViewControlsProps) {
  const currentGroupOption = groupOptions.find(option => option.value === groupBy);

  return (
    <div className="flex items-center gap-4">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">View:</span>
        <div className="flex border rounded-lg p-1 bg-gray-50">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="px-3 h-8"
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="px-3 h-8"
            title="List View"
          >
            <List className="w-4 h-4" />
          </Button>
          {/* Future Kanban view */}
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="px-3 h-8 opacity-40"
            title="Kanban View (Coming Soon)"
          >
            <Kanban className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grouping Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Group by:</span>
        <div className="relative">
          <select
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value as any)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors"
          >
            {groupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        
        {/* Current Selection Badge */}
        {currentGroupOption && groupBy !== 'none' && (
          <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
            <span>{currentGroupOption.icon}</span>
            <span className="text-xs">{currentGroupOption.label}</span>
          </Badge>
        )}
      </div>

      {/* Quick Group Buttons */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-gray-700">Quick:</span>
        <div className="flex gap-1">
          <Button
            variant={groupBy === 'department' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onGroupByChange('department')}
            className="h-8 px-3 text-xs"
            title="Group by Department"
          >
            🏢 Dept
          </Button>
          <Button
            variant={groupBy === 'status' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onGroupByChange('status')}
            className="h-8 px-3 text-xs"
            title="Group by Status"
          >
            📊 Status
          </Button>
          <Button
            variant={groupBy === 'health' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onGroupByChange('health')}
            className="h-8 px-3 text-xs"
            title="Group by Health"
          >
            ❤️ Health
          </Button>
        </div>
      </div>
    </div>
  );
}