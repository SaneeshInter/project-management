import { useState } from 'react';
import { Search, Filter, X, ChevronDown, Calendar, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ProjectStatus, 
  ProjectCategory, 
  Department,
  Office
} from '@/types';

interface FilterOptions {
  searchTerm: string;
  status: ProjectStatus | 'ALL';
  category: ProjectCategory | 'ALL';
  department: Department | 'ALL';
  office: Office | 'ALL';
  healthScore: 'ALL' | 'CRITICAL' | 'AT_RISK' | 'GOOD' | 'HEALTHY';
  timeStatus: 'ALL' | 'OVERDUE' | 'DUE_SOON' | 'ON_TRACK';
  sortBy: 'name' | 'targetDate' | 'healthScore' | 'progress' | 'createdAt' | 'lastActivity';
  sortOrder: 'asc' | 'desc';
  showOnlyActive: boolean;
  showOverdueOnly: boolean;
  showWithDependencies: boolean;
}

interface AdvancedProjectFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onPresetFilter: (preset: string) => void;
}

const presetFilters = [
  {
    id: 'needs_attention',
    label: 'Needs Attention',
    icon: <AlertTriangle className="h-4 w-4" />,
    description: 'Overdue or at-risk projects',
    color: 'bg-red-100 text-red-800 border-red-300'
  },
  {
    id: 'due_soon',
    label: 'Due Soon',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Projects due within 7 days',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  {
    id: 'my_projects',
    label: 'My Projects',
    icon: <Users className="h-4 w-4" />,
    description: 'Projects you own or are assigned to',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 'high_performance',
    label: 'High Performance',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Projects with good health scores',
    color: 'bg-green-100 text-green-800 border-green-300'
  }
];

const sortOptions = [
  { value: 'name', label: 'Project Name' },
  { value: 'targetDate', label: 'Target Date' },
  { value: 'healthScore', label: 'Health Score' },
  { value: 'progress', label: 'Progress' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'lastActivity', label: 'Last Activity' }
];

export default function AdvancedProjectFilters({
  filters,
  onFiltersChange,
  onPresetFilter
}: AdvancedProjectFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'ALL' && value !== '' && value !== false && value !== 'name' && value !== 'asc'
  ).length;

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      status: 'ALL',
      category: 'ALL',
      department: 'ALL',
      office: 'ALL',
      healthScore: 'ALL',
      timeStatus: 'ALL',
      sortBy: 'name',
      sortOrder: 'asc',
      showOnlyActive: false,
      showOverdueOnly: false,
      showWithDependencies: false
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick Preset Filters */}
      <div className="flex flex-wrap gap-2">
        {presetFilters.map(preset => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => onPresetFilter(preset.id)}
            className={`${preset.color} hover:opacity-80 transition-opacity`}
          >
            {preset.icon}
            <span className="ml-1">{preset.label}</span>
          </Button>
        ))}
      </div>

      {/* Main Search and Basic Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name, client, project code..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value as ProjectStatus | 'ALL')}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-32"
        >
          <option value="ALL">All Status</option>
          {Object.values(ProjectStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value as ProjectCategory | 'ALL')}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-40"
        >
          <option value="ALL">All Categories</option>
          {Object.values(ProjectCategory).map(category => (
            <option key={category} value={category}>
              {category.replace('_', ' ')}
            </option>
          ))}
        </select>

        {/* Office Filter */}
        <select
          value={filters.office}
          onChange={(e) => handleFilterChange('office', e.target.value as Office | 'ALL')}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-32"
        >
          <option value="ALL">All Offices</option>
          {Object.values(Office).map(office => (
            <option key={office} value={office}>
              {office.toLowerCase().replace(/^\w/, c => c.toUpperCase())}
            </option>
          ))}
        </select>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Advanced
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Advanced Filters
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Row 1: Department and Health Score */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value as Department | 'ALL')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Departments</option>
                  {Object.values(Department).map(department => (
                    <option key={department} value={department}>
                      {department.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Health Score</label>
                <select
                  value={filters.healthScore}
                  onChange={(e) => handleFilterChange('healthScore', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Health Levels</option>
                  <option value="CRITICAL">Critical (0-49%)</option>
                  <option value="AT_RISK">At Risk (50-69%)</option>
                  <option value="GOOD">Good (70-84%)</option>
                  <option value="HEALTHY">Healthy (85%+)</option>
                </select>
              </div>
            </div>

            {/* Row 2: Time Status and Sort Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Time Status</label>
                <select
                  value={filters.timeStatus}
                  onChange={(e) => handleFilterChange('timeStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Time Status</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="DUE_SOON">Due Soon (≤7 days)</option>
                  <option value="ON_TRACK">On Track</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            {/* Row 3: Boolean Filters */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showOnlyActive"
                  checked={filters.showOnlyActive}
                  onChange={(e) => handleFilterChange('showOnlyActive', e.target.checked)}
                  className="rounded border-input"
                />
                <label htmlFor="showOnlyActive" className="text-sm font-medium">
                  Show only active projects
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showOverdueOnly"
                  checked={filters.showOverdueOnly}
                  onChange={(e) => handleFilterChange('showOverdueOnly', e.target.checked)}
                  className="rounded border-input"
                />
                <label htmlFor="showOverdueOnly" className="text-sm font-medium">
                  Show only overdue projects
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showWithDependencies"
                  checked={filters.showWithDependencies}
                  onChange={(e) => handleFilterChange('showWithDependencies', e.target.checked)}
                  className="rounded border-input"
                />
                <label htmlFor="showWithDependencies" className="text-sm font-medium">
                  Show only projects with dependencies
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Active filters:</span>
          {filters.status !== 'ALL' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <X 
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('status', 'ALL')}
              />
            </Badge>
          )}
          {filters.category !== 'ALL' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {filters.category.replace('_', ' ')}
              <X 
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('category', 'ALL')}
              />
            </Badge>
          )}
          {filters.department !== 'ALL' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Department: {filters.department.replace('_', ' ')}
              <X 
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('department', 'ALL')}
              />
            </Badge>
          )}
          {filters.office !== 'ALL' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Office: {filters.office.toLowerCase().replace(/^\w/, c => c.toUpperCase())}
              <X 
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('office', 'ALL')}
              />
            </Badge>
          )}
          {filters.healthScore !== 'ALL' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Health: {filters.healthScore.replace('_', ' ')}
              <X 
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('healthScore', 'ALL')}
              />
            </Badge>
          )}
          {filters.timeStatus !== 'ALL' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Time: {filters.timeStatus.replace('_', ' ')}
              <X 
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange('timeStatus', 'ALL')}
              />
            </Badge>
          )}
          {(filters.showOnlyActive || filters.showOverdueOnly || filters.showWithDependencies) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Special filters active
              <X 
                className="w-3 h-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('showOnlyActive', false);
                  handleFilterChange('showOverdueOnly', false);
                  handleFilterChange('showWithDependencies', false);
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}