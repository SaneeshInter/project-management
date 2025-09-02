import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Upload, Users, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Employee, 
  User,
  EmployeeStatus, 
  Department, 
  Role, 
  ImportResult,
  usersApi 
} from '@/types';
import EmployeeCard from './EmployeeCard';
import CSVImportModal from './CSVImportModal';
import AddEmployeeModal from './AddEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import AlertDialog from '@/components/ui/alert-dialog';
import { employeeUtils, departmentUtils } from '@/lib/employeeUtils';
import { CSVImportService } from '@/lib/csvUtils';
import { toast } from 'sonner';

interface EmployeeFilters {
  search: string;
  status: EmployeeStatus | 'ALL';
  department: Department | 'ALL';
  role: Role | 'ALL';
}

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForceDelete, setShowForceDelete] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: '',
    status: 'ALL',
    department: 'ALL',
    role: 'ALL'
  });

  // Fetch real users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await usersApi.getAll();
        // Convert User objects to Employee objects with default employee fields
        const employeeData: Employee[] = response.data.map((user: User) => ({
          ...user,
          // Extract department from departmentMaster or use existing department
          department: user.departmentMaster?.name as Department || user.department,
          status: EmployeeStatus.ACTIVE,
          weeklyLimit: 40,
          dailyLimit: 8,
          trackingEnabled: true,
          timesheetsEnabled: false,
          countsTowardPricing: true,
          dateAdded: user.createdAt,
          projectAssignments: []
        }));
        
        setEmployees(employeeData);
        setFilteredEmployees(employeeData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load employees');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = employees;

    // Search filter
    if (filters.search) {
      filtered = employeeUtils.searchEmployees(filtered, filters.search);
    }

    // Status filter
    if (filters.status !== 'ALL') {
      filtered = employeeUtils.filterByStatus(filtered, filters.status);
    }

    // Department filter
    if (filters.department !== 'ALL') {
      filtered = employeeUtils.filterByDepartment(filtered, filters.department);
    }

    // Role filter
    if (filters.role !== 'ALL') {
      filtered = filtered.filter(emp => emp.role === filters.role);
    }

    setFilteredEmployees(filtered);
  }, [employees, filters]);

  const handleFilterChange = (key: keyof EmployeeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      department: 'ALL',
      role: 'ALL'
    });
  };

  const handleImportSuccess = (result: ImportResult) => {
    toast.success(`Successfully imported ${result.successCount} employees`);
    // In real implementation, refresh employee list from API
    setShowImportModal(false);
  };

  const handleEmployeeAdded = (newEmployee: Employee) => {
    setEmployees(prev => [...prev, newEmployee]);
    setShowAddModal(false);
  };

  const handleEmployeeUpdated = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    ));
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  const confirmDeleteEmployee = async (force: boolean = false) => {
    if (!selectedEmployee) return;
    
    try {
      await usersApi.delete(selectedEmployee.id, force);
      setEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id));
      toast.success(`Employee ${selectedEmployee.name} deleted successfully`);
      setShowDeleteDialog(false);
      setShowForceDelete(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const message = error.response?.data?.message || error.message || 'Failed to delete employee';
      
      if (!force && error.response?.status === 400) {
        // Show force delete option for constraint violations
        setShowForceDelete(true);
        setErrorMessage(message + '\n\nWould you like to force delete? This will remove all related records.');
      } else {
        setShowForceDelete(false);
      }
      
      setShowErrorDialog(true);
      setShowDeleteDialog(false);
    }
  };

  const handleForceDelete = async () => {
    setShowErrorDialog(false);
    await confirmDeleteEmployee(true);
  };

  const handleExportCSV = () => {
    CSVImportService.exportEmployeesToCSV(filteredEmployees);
    toast.success('Employee data exported successfully');
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDeleteDialog(true);
  };

  const handleAssignProject = (employee: Employee) => {
    // TODO: Implement project assignment
    toast.info(`Project assignment for ${employee.name} - coming soon`);
  };

  const handleViewDetails = (employee: Employee) => {
    // TODO: Implement view details
    toast.info(`View details for ${employee.name} - coming soon`);
  };

  const getStats = () => {
    const total = employees.length;
    const active = employees.filter(e => e.status === EmployeeStatus.ACTIVE).length;
    const inactive = total - active;
    const overloaded = employees.filter(e => employeeUtils.calculateWorkload(e).isOverloaded).length;

    return { total, active, inactive, overloaded };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">Manage employees, assignments, and CSV imports</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          
          <Button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Employees</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <div className="text-sm text-muted-foreground">Inactive</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.overloaded}</div>
            <div className="text-sm text-muted-foreground">Overloaded</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search employees..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(filters.status !== 'ALL' || filters.department !== 'ALL' || filters.role !== 'ALL') && (
              <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                !
              </Badge>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="ALL">All Statuses</option>
                  <option value={EmployeeStatus.ACTIVE}>Active</option>
                  <option value={EmployeeStatus.INACTIVE}>Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="ALL">All Departments</option>
                  {Object.values(Department).map(dept => (
                    <option key={dept} value={dept}>
                      {departmentUtils.formatDepartmentName(dept)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="ALL">All Roles</option>
                  <option value={Role.ADMIN}>Admin</option>
                  <option value={Role.PROJECT_MANAGER}>Project Manager</option>
                  <option value={Role.DEVELOPER}>Developer</option>
                  <option value={Role.DESIGNER}>Designer</option>
                  <option value={Role.CLIENT}>Client</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredEmployees.length} of {employees.length} employees
          {filters.search && (
            <span> • Search: "{filters.search}"</span>
          )}
        </div>
      </div>

      {/* Employee Grid/List */}
      {isLoading ? (
        <div className={`grid ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
            : 'grid-cols-1'
        } gap-6`}>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredEmployees.length > 0 ? (
        <div className={`grid ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
            : 'grid-cols-1 max-w-4xl'
        } gap-6`}>
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
              onAssignProject={handleAssignProject}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No employees found</h3>
          <p className="text-muted-foreground mb-4">
            {employees.length === 0 
              ? "Get started by adding your first employee or importing from CSV"
              : "Try adjusting your search criteria or filters"
            }
          </p>
          {employees.length === 0 ? (
            <div className="flex justify-center gap-3">
              <Button onClick={() => setShowImportModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import from CSV
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onEmployeeAdded={handleEmployeeAdded}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={showEditModal}
        employee={selectedEmployee}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEmployee(null);
        }}
        onEmployeeUpdated={handleEmployeeUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedEmployee(null);
        }}
        onConfirm={() => confirmDeleteEmployee(false)}
        title="Delete Employee"
        message={`Are you sure you want to delete ${selectedEmployee?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Error Dialog */}
      <AlertDialog
        isOpen={showErrorDialog}
        onClose={() => {
          setShowErrorDialog(false);
          setShowForceDelete(false);
        }}
        title="Operation Failed"
        message={errorMessage}
        type="error"
      />
      
      {/* Force Delete Confirmation */}
      {showForceDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Force Delete Warning</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete {selectedEmployee?.name} and ALL related records including projects, tasks, and comments. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowErrorDialog(false);
                  setShowForceDelete(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleForceDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Force Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}