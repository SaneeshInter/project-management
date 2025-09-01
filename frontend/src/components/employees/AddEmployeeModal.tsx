import { useState } from 'react';
import { X, User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Employee, 
  EmployeeStatus, 
  Department, 
  Role 
} from '@/types';
import { departmentUtils } from '@/lib/employeeUtils';
import { toast } from 'sonner';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded: (employee: Employee) => void;
}

interface EmployeeFormData {
  name: string;
  email: string;
  role: Role;
  department: Department | '';
  status: EmployeeStatus;
  weeklyLimit: number | '';
  dailyLimit: number | '';
  trackingEnabled: boolean;
  timesheetsEnabled: boolean;
  countsTowardPricing: boolean;
}

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onEmployeeAdded
}: AddEmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    role: Role.DEVELOPER,
    department: '',
    status: EmployeeStatus.ACTIVE,
    weeklyLimit: 40,
    dailyLimit: 8,
    trackingEnabled: true,
    timesheetsEnabled: false,
    countsTowardPricing: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (formData.weeklyLimit && (formData.weeklyLimit < 1 || formData.weeklyLimit > 168)) {
      newErrors.weeklyLimit = 'Weekly limit must be between 1 and 168 hours';
    }

    if (formData.dailyLimit && (formData.dailyLimit < 1 || formData.dailyLimit > 24)) {
      newErrors.dailyLimit = 'Daily limit must be between 1 and 24 hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create employee object
      const newEmployee: Employee = {
        id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        department: formData.department || undefined,
        status: formData.status,
        weeklyLimit: formData.weeklyLimit || undefined,
        dailyLimit: formData.dailyLimit || undefined,
        trackingEnabled: formData.trackingEnabled,
        timesheetsEnabled: formData.timesheetsEnabled,
        countsTowardPricing: formData.countsTowardPricing,
        dateAdded: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectAssignments: []
      };

      // In real implementation, this would be an API call
      onEmployeeAdded(newEmployee);
      toast.success(`Employee ${newEmployee.name} added successfully`);
      handleClose();
    } catch (error) {
      toast.error('Failed to add employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: Role.DEVELOPER,
      department: '',
      status: EmployeeStatus.ACTIVE,
      weeklyLimit: 40,
      dailyLimit: 8,
      trackingEnabled: true,
      timesheetsEnabled: false,
      countsTowardPricing: true
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Add New Employee
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
                <label htmlFor="role" className="block text-sm font-medium mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value as Role)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={Role.ADMIN}>Admin</option>
                  <option value={Role.PROJECT_MANAGER}>Project Manager</option>
                  <option value={Role.DEVELOPER}>Developer</option>
                  <option value={Role.DESIGNER}>Designer</option>
                  <option value={Role.CLIENT}>Client</option>
                </select>
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium mb-2">
                  Department
                </label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value as Department | '')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No department</option>
                  {Object.values(Department).map(dept => (
                    <option key={dept} value={dept}>
                      {departmentUtils.formatDepartmentName(dept)}
                    </option>
                  ))}
                </select>
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

          {/* Work Limits */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Work Limits</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="weeklyLimit" className="block text-sm font-medium mb-2">
                  Weekly Limit (hours)
                </label>
                <Input
                  id="weeklyLimit"
                  type="number"
                  min="1"
                  max="168"
                  value={formData.weeklyLimit}
                  onChange={(e) => handleInputChange('weeklyLimit', e.target.value ? Number(e.target.value) : '')}
                  placeholder="40"
                  className={errors.weeklyLimit ? 'border-red-300' : ''}
                />
                {errors.weeklyLimit && (
                  <p className="text-sm text-red-600 mt-1">{errors.weeklyLimit}</p>
                )}
              </div>

              <div>
                <label htmlFor="dailyLimit" className="block text-sm font-medium mb-2">
                  Daily Limit (hours)
                </label>
                <Input
                  id="dailyLimit"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.dailyLimit}
                  onChange={(e) => handleInputChange('dailyLimit', e.target.value ? Number(e.target.value) : '')}
                  placeholder="8"
                  className={errors.dailyLimit ? 'border-red-300' : ''}
                />
                {errors.dailyLimit && (
                  <p className="text-sm text-red-600 mt-1">{errors.dailyLimit}</p>
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Settings</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trackingEnabled"
                  checked={formData.trackingEnabled}
                  onCheckedChange={(checked) => handleInputChange('trackingEnabled', checked)}
                />
                <label htmlFor="trackingEnabled" className="text-sm font-medium">
                  Enable time tracking
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="timesheetsEnabled"
                  checked={formData.timesheetsEnabled}
                  onCheckedChange={(checked) => handleInputChange('timesheetsEnabled', checked)}
                />
                <label htmlFor="timesheetsEnabled" className="text-sm font-medium">
                  Enable timesheets
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="countsTowardPricing"
                  checked={formData.countsTowardPricing}
                  onCheckedChange={(checked) => handleInputChange('countsTowardPricing', checked)}
                />
                <label htmlFor="countsTowardPricing" className="text-sm font-medium">
                  Counts toward pricing plan
                </label>
              </div>
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
            {isSubmitting ? 'Adding...' : 'Add Employee'}
          </Button>
        </div>
      </Card>
    </div>
  );
}