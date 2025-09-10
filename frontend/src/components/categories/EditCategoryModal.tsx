import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ArrowUp, ArrowDown, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Department, CategoryMaster } from '@/types';
import { categoriesApi } from '@/lib/api';

const editCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  code: z.string().min(1, 'Category code is required').regex(/^[A-Z_]+$/, 'Code must be uppercase letters and underscores only'),
  description: z.string().optional(),
  defaultStartDept: z.nativeEnum(Department).optional(),
  estimatedTotalHours: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
  departments: z.array(z.nativeEnum(Department)).min(1, 'At least one department is required'),
});

interface WorkflowStep {
  department: Department;
  sequence: number;
  isRequired: boolean;
  estimatedHours: number;
  estimatedDays: number;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: CategoryMaster;
}

export default function EditCategoryModal({ isOpen, onClose, onSuccess, category }: EditCategoryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [showWorkflowConfig, setShowWorkflowConfig] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<z.infer<typeof editCategorySchema>>({
    resolver: zodResolver(editCategorySchema),
  });

  useEffect(() => {
    if (category && isOpen) {
      // Populate basic form fields
      setValue('name', category.name);
      setValue('code', category.code);
      setValue('description', category.description || '');
      setValue('defaultStartDept', category.defaultStartDept);
      setValue('estimatedTotalHours', category.estimatedTotalHours || undefined);
      setValue('isActive', category.isActive);

      // Load existing workflow steps
      if (category.departmentMappings && category.departmentMappings.length > 0) {
        const departments = category.departmentMappings
          .sort((a, b) => a.sequence - b.sequence)
          .map(mapping => mapping.department);
        
        const steps: WorkflowStep[] = category.departmentMappings
          .sort((a, b) => a.sequence - b.sequence)
          .map(mapping => ({
            department: mapping.department,
            sequence: mapping.sequence,
            isRequired: mapping.isRequired,
            estimatedHours: mapping.estimatedHours || mapping.estimatedDays ? mapping.estimatedDays * 8 : 0,
            estimatedDays: mapping.estimatedDays || Math.ceil((mapping.estimatedHours || 0) / 8),
          }));

        setSelectedDepartments(departments);
        setWorkflowSteps(steps);
        setValue('departments', departments);
      } else {
        // Default to PMO if no workflow exists
        setSelectedDepartments([Department.PMO]);
        setWorkflowSteps([{
          department: Department.PMO,
          sequence: 1,
          isRequired: true,
          estimatedHours: 64,
          estimatedDays: 8,
        }]);
        setValue('departments', [Department.PMO]);
      }
    }
  }, [category, isOpen, setValue]);

  // Auto-update estimated total hours when workflow steps change
  useEffect(() => {
    const totalHours = workflowSteps.reduce((sum, step) => sum + step.estimatedHours, 0);
    setValue('estimatedTotalHours', totalHours);
  }, [workflowSteps, setValue]);

  // Handle department selection
  const handleDepartmentToggle = (department: Department) => {
    let updatedDepartments: Department[];
    
    if (selectedDepartments.includes(department)) {
      updatedDepartments = selectedDepartments.filter(d => d !== department);
    } else {
      updatedDepartments = [...selectedDepartments, department];
    }
    
    // Sort departments by typical workflow order
    const departmentOrder = [Department.PMO, Department.DESIGN, Department.HTML, Department.PHP, Department.REACT, Department.WORDPRESS, Department.QA, Department.DELIVERY, Department.MANAGER];
    updatedDepartments.sort((a, b) => departmentOrder.indexOf(a) - departmentOrder.indexOf(b));
    
    setSelectedDepartments(updatedDepartments);
    setValue('departments', updatedDepartments);

    // Update workflow steps based on new department selection
    const newWorkflowSteps: WorkflowStep[] = updatedDepartments.map((dept, index) => {
      const existingStep = workflowSteps.find(step => step.department === dept);
      if (existingStep) {
        return { ...existingStep, sequence: index + 1 };
      } else {
        const estimates = getDefaultEstimates(dept);
        return {
          department: dept,
          sequence: index + 1,
          isRequired: true,
          estimatedHours: estimates.hours,
          estimatedDays: estimates.days,
        };
      }
    });
    setWorkflowSteps(newWorkflowSteps);
  };

  const getDefaultEstimates = (dept: Department) => {
    const estimates = {
      [Department.PMO]: { days: 8 },
      [Department.DESIGN]: { days: 12 },
      [Department.HTML]: { days: 10 },
      [Department.PHP]: { days: 35 },
      [Department.REACT]: { days: 40 },
      [Department.WORDPRESS]: { days: 30 },
      [Department.QA]: { days: 15 },
      [Department.DELIVERY]: { days: 5 },
      [Department.MANAGER]: { days: 3 },
      [Department.SALES_EXE]: { days: 2 },
    };
    const defaultDays = estimates[dept]?.days || 7;
    return { 
      days: defaultDays, 
      hours: defaultDays * 8 // 8 hours per day
    };
  };

  // Workflow management functions
  const updateWorkflowStep = (index: number, field: keyof WorkflowStep, value: any) => {
    const newSteps = [...workflowSteps];
    const updatedStep = { ...newSteps[index], [field]: value };
    
    // Auto-calculate hours/days based on 8 hours per day
    if (field === 'estimatedDays') {
      const days = Number(value) || 0;
      updatedStep.estimatedHours = days * 8;
    } else if (field === 'estimatedHours') {
      const hours = Number(value) || 0;
      updatedStep.estimatedDays = Math.ceil(hours / 8); // Round up to nearest day
    }
    
    newSteps[index] = updatedStep;
    setWorkflowSteps(newSteps);
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...workflowSteps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    // Resequence
    const resequencedSteps = newSteps.map((step, i) => ({
      ...step,
      sequence: i + 1,
    }));
    setWorkflowSteps(resequencedSteps);
  };

  const moveStepDown = (index: number) => {
    if (index === workflowSteps.length - 1) return;
    const newSteps = [...workflowSteps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    // Resequence
    const resequencedSteps = newSteps.map((step, i) => ({
      ...step,
      sequence: i + 1,
    }));
    setWorkflowSteps(resequencedSteps);
  };

  const getDepartmentBadgeColor = (dept: Department, isRequired: boolean) => {
    if (!isRequired) return 'bg-gray-100 text-gray-700';
    
    switch (dept) {
      case 'PMO': return 'bg-blue-100 text-blue-800';
      case 'DESIGN': return 'bg-purple-100 text-purple-800';
      case 'HTML': return 'bg-orange-100 text-orange-800';
      case 'PHP': return 'bg-green-100 text-green-800';
      case 'REACT': return 'bg-cyan-100 text-cyan-800';
      case 'WORDPRESS': return 'bg-yellow-100 text-yellow-800';
      case 'QA': return 'bg-pink-100 text-pink-800';
      case 'DELIVERY': return 'bg-indigo-100 text-indigo-800';
      case 'MANAGER': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const onSubmit = async (data: z.infer<typeof editCategorySchema>) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Update the category first
      const updateData = {
        name: data.name,
        code: data.code,
        description: data.description,
        defaultStartDept: data.defaultStartDept,
        estimatedTotalHours: data.estimatedTotalHours,
        isActive: data.isActive,
      };
      
      await categoriesApi.update(category.id, updateData);

      // Update department workflow with user-configured steps
      if (workflowSteps.length > 0) {
        const departmentWorkflow = workflowSteps.map(step => ({
          department: step.department,
          sequence: step.sequence,
          isRequired: step.isRequired,
          estimatedHours: step.estimatedHours,
          estimatedDays: step.estimatedDays,
        }));

        await categoriesApi.bulkCreateDepartmentMappings(category.id, departmentWorkflow);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Category</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Category Name *
                </label>
                <Input
                  id="name"
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder="e.g., Mobile Application"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Category Code *
                </label>
                <Input
                  id="code"
                  {...register('code')}
                  className={errors.code ? 'border-red-500' : ''}
                  placeholder="e.g., MOBILE_APP"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Use uppercase letters and underscores only
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Describe this category and what types of projects it includes..."
              />
            </div>

            {/* Department Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Departments *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(Department).map(department => (
                  <div key={department} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`dept-${department}`}
                      checked={selectedDepartments.includes(department)}
                      onChange={() => handleDepartmentToggle(department)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label 
                      htmlFor={`dept-${department}`} 
                      className="text-sm font-medium cursor-pointer"
                    >
                      {department}
                    </label>
                  </div>
                ))}
              </div>
              {errors.departments && (
                <p className="text-sm text-red-500">{errors.departments.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Select the departments that will be involved in projects of this category.
                Departments will be automatically sequenced in a logical workflow order.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="defaultStartDept" className="text-sm font-medium">
                  Default Start Department
                </label>
                <select
                  id="defaultStartDept"
                  {...register('defaultStartDept')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.values(Department).map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="estimatedTotalHours" className="text-sm font-medium">
                  Estimated Total Hours
                </label>
                <Input
                  id="estimatedTotalHours"
                  type="number"
                  {...register('estimatedTotalHours', { valueAsNumber: true })}
                  placeholder="Auto-calculated from workflow"
                  className="bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            {workflowSteps.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Workflow Configuration</h4>
                    <p className="text-xs text-blue-700">
                      {showWorkflowConfig ? 'Configure department workflow details' : 'Auto-generated workflow preview'}
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowWorkflowConfig(!showWorkflowConfig)}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    {showWorkflowConfig ? 'Simple View' : 'Configure'}
                  </Button>
                </div>

                {!showWorkflowConfig ? (
                  // Simple Preview
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {workflowSteps.map((step, index) => (
                        <div key={step.department} className="flex items-center text-sm">
                          <Badge 
                            className={`${getDepartmentBadgeColor(step.department, step.isRequired)} border`}
                          >
                            {step.sequence}. {step.department}
                            {step.estimatedDays && ` (${step.estimatedDays}d, ${step.estimatedHours}h)`}
                            {!step.isRequired && ' (Optional)'}
                          </Badge>
                          {index < workflowSteps.length - 1 && (
                            <span className="mx-2 text-blue-600">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-blue-600">
                      Total estimated: {workflowSteps.reduce((sum, step) => sum + step.estimatedDays, 0)} days, {workflowSteps.reduce((sum, step) => sum + step.estimatedHours, 0)} hours
                    </div>
                  </div>
                ) : (
                  // Advanced Configuration
                  <div className="space-y-3">
                    <div className="text-xs text-blue-700 mb-3">
                      Configure workflow details. Hours are automatically calculated at 8 hours per day.
                    </div>
                    {workflowSteps.map((step, index) => (
                      <Card key={step.department} className="p-3 bg-white border">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          {/* Step Number */}
                          <div className="col-span-1 text-center">
                            <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                              {step.sequence}
                            </Badge>
                          </div>

                          {/* Department */}
                          <div className="col-span-2">
                            <span className="text-sm font-medium">{step.department}</span>
                          </div>

                          {/* Required Toggle */}
                          <div className="col-span-2 flex items-center space-x-1">
                            <input
                              type="checkbox"
                              checked={step.isRequired}
                              onChange={(e) => updateWorkflowStep(index, 'isRequired', e.target.checked)}
                              className="rounded text-xs"
                            />
                            <span className="text-xs">Required</span>
                          </div>

                          {/* Estimated Days */}
                          <div className="col-span-2">
                            <Input
                              type="number"
                              placeholder="Days"
                              value={step.estimatedDays || ''}
                              onChange={(e) => updateWorkflowStep(index, 'estimatedDays', e.target.value ? Number(e.target.value) : 0)}
                              className="h-8 text-xs"
                            />
                          </div>

                          {/* Estimated Hours (Auto-calculated) */}
                          <div className="col-span-2">
                            <Input
                              type="number"
                              placeholder="Hours"
                              value={step.estimatedHours || ''}
                              onChange={(e) => updateWorkflowStep(index, 'estimatedHours', e.target.value ? Number(e.target.value) : 0)}
                              className="h-8 text-xs bg-gray-50"
                            />
                          </div>

                          {/* Actions */}
                          <div className="col-span-3 flex items-center justify-end space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStepUp(index)}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStepDown(index)}
                              disabled={index === workflowSteps.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                {...register('isActive')}
                className="rounded border-input"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Category is active and available for new projects
              </label>
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Category'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}