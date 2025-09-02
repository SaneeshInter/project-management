import { useState, useEffect } from 'react';
import { X, User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Employee, 
  EmployeeStatus, 
  DepartmentMaster,
  RoleMaster,
  Role,
  usersApi,
  departmentsApi,
  rolesApi
} from '@/types';
import { toast } from 'sonner';

interface EditEmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onEmployeeUpdated: (employee: Employee) => void;
}

interface EmployeeFormData {
  name: string;
  email: string;
  roleId: string;
  departmentId: string;
  status: EmployeeStatus;
}

export default function EditEmployeeModal({
  isOpen,
  employee,
  onClose,
  onEmployeeUpdated
}: EditEmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    roleId: '',
    departmentId: '',
    status: EmployeeStatus.ACTIVE
  });

  const [departments, setDepartments] = useState<DepartmentMaster[]>([]);
  const [roles, setRoles] = useState<RoleMaster[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<RoleMaster[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Initialize form data with employee data
  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        name: employee.name,
        email: employee.email,
        roleId: employee.roleMaster?.id || '',
        departmentId: employee.departmentMaster?.id || '',
        status: employee.status
      });
    }
  }, [employee, isOpen]);

  // Fetch departments and roles on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptResponse, rolesResponse] = await Promise.all([
          departmentsApi.getAll(),
          rolesApi.getAll()
        ]);
        setDepartments(deptResponse.filter((dept: DepartmentMaster) => dept.isActive));
        setRoles(rolesResponse.filter((role: RoleMaster) => role.isActive));
        setFilteredRoles(rolesResponse.filter((role: RoleMaster) => role.isActive));
      } catch (error) {
        toast.error('Failed to load departments and roles');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Filter roles by selected department
  useEffect(() => {
    if (formData.departmentId) {
      setFilteredRoles(roles.filter(role => role.departmentId === formData.departmentId));
      // Reset role selection if current role doesn't belong to selected department
      if (formData.roleId && !roles.find(r => r.id === formData.roleId && r.departmentId === formData.departmentId)) {
        setFormData(prev => ({ ...prev, roleId: '' }));
      }
    } else {
      setFilteredRoles(roles);
    }
  }, [formData.departmentId, roles]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!employee || !validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update user via API
      const updatedUser = await usersApi.update(employee.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.roleId as Role,
        department: formData.departmentId as any
      });

      // Convert to Employee format for UI
      const selectedRole = roles.find(r => r.id === formData.roleId);
      const selectedDept = departments.find(d => d.id === formData.departmentId);
      
      const updatedEmployee: Employee = {
        ...updatedUser,
        role: selectedRole?.code as any,
        department: selectedDept?.code as any,
        status: formData.status,
        trackingEnabled: employee.trackingEnabled,
        timesheetsEnabled: employee.timesheetsEnabled,
        countsTowardPricing: employee.countsTowardPricing,
        dateAdded: employee.dateAdded,
        projectAssignments: employee.projectAssignments || []
      };

      onEmployeeUpdated(updatedEmployee);
      toast.success(`Employee ${updatedEmployee.name} updated successfully`);
      handleClose();
    } catch (error: any) {
      console.error('Error updating user:', error);
      const message = error.response?.data?.message || error.message || 'Failed to update employee';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      roleId: '',
      departmentId: '',
      status: EmployeeStatus.ACTIVE
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit Employee
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className={errors.name ? 'border-red-300' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="employee@company.com"
                  className={errors.email ? 'border-red-300' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="block text-sm font-medium mb-2">
                  Department *
                </label>
                <select
                  id="department"
                  value={formData.departmentId}
                  onChange={(e) => handleInputChange('departmentId', e.target.value)}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.departmentId ? 'border-red-300' : ''}`}
                  disabled={isLoadingData}
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="text-sm text-red-600 mt-1">{errors.departmentId}</p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  value={formData.roleId}
                  onChange={(e) => handleInputChange('roleId', e.target.value)}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.roleId ? 'border-red-300' : ''}`}
                  disabled={isLoadingData || !formData.departmentId}
                >
                  <option value="">Select role</option>
                  {filteredRoles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {errors.roleId && (
                  <p className="text-sm text-red-600 mt-1">{errors.roleId}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-2">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as EmployeeStatus)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={EmployeeStatus.ACTIVE}>Active</option>
                <option value={EmployeeStatus.INACTIVE}>Inactive</option>
              </select>
            </div>
          </div>

        </CardContent>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Updating...' : 'Update Employee'}
          </Button>
        </div>
      </Card>
    </div>
  );
}