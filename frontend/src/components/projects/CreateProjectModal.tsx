import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectsStore } from '@/stores/projects';
import { CreateProjectDto, ProjectCategory, ProjectStatus, Department, Office } from '@/types';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  office: z.string().min(1, 'Office is required'),
  category: z.nativeEnum(ProjectCategory),
  pagesCount: z.number().min(1).optional(),
  currentDepartment: z.nativeEnum(Department),
  nextDepartment: z.nativeEnum(Department).optional(),
  targetDate: z.string().min(1, 'Target date is required'),
  status: z.nativeEnum(ProjectStatus).optional(),
  clientName: z.string().optional(),
  observations: z.string().optional(),
  deviationReason: z.string().optional(),
  dependency: z.boolean().optional(),
  startDate: z.string().optional(),
});

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { createProject, isLoading } = useProjectsStore();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProjectDto>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      status: ProjectStatus.ACTIVE,
      dependency: false,
      currentDepartment: Department.PMO,
      office: 'KOCHI',
    },
  });

  const onSubmit = async (data: CreateProjectDto) => {
    try {
      setError('');
      
      // Convert date strings to ISO DateTime format
      const formattedData = {
        ...data,
        targetDate: data.targetDate ? `${data.targetDate}T00:00:00Z` : data.targetDate,
        startDate: data.startDate ? `${data.startDate}T00:00:00Z` : data.startDate,
      };
      
      await createProject(formattedData);
      reset();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Project</CardTitle>
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
                  Project Name *
                </label>
                <Input
                  id="name"
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="office" className="text-sm font-medium">
                  Office *
                </label>
                <select
                  id="office"
                  {...register('office')}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.office ? 'border-red-500' : ''}`}
                >
                  {Object.values(Office).map(office => (
                    <option key={office} value={office}>
                      {office.toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                    </option>
                  ))}
                </select>
                {errors.office && (
                  <p className="text-sm text-red-500">{errors.office.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category *
                </label>
                <select
                  id="category"
                  {...register('category')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.values(ProjectCategory).map(category => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="pagesCount" className="text-sm font-medium">
                  Pages Count
                </label>
                <Input
                  id="pagesCount"
                  type="number"
                  {...register('pagesCount', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="currentDepartment" className="text-sm font-medium">
                  Current Department *
                </label>
                <select
                  id="currentDepartment"
                  {...register('currentDepartment')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.values(Department).map(dept => (
                    <option key={dept} value={dept}>
                      {dept.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {errors.currentDepartment && (
                  <p className="text-sm text-red-500">{errors.currentDepartment.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="nextDepartment" className="text-sm font-medium">
                  Next Department
                </label>
                <select
                  id="nextDepartment"
                  {...register('nextDepartment')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select next department (optional)</option>
                  {Object.values(Department).map(dept => (
                    <option key={dept} value={dept}>
                      {dept.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {errors.nextDepartment && (
                  <p className="text-sm text-red-500">{errors.nextDepartment.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="targetDate" className="text-sm font-medium">
                  Target Date *
                </label>
                <Input
                  id="targetDate"
                  type="date"
                  {...register('targetDate')}
                  className={errors.targetDate ? 'border-red-500' : ''}
                />
                {errors.targetDate && (
                  <p className="text-sm text-red-500">{errors.targetDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.values(ProjectStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="clientName" className="text-sm font-medium">
                  Client Name
                </label>
                <Input
                  id="clientName"
                  {...register('clientName')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="observations" className="text-sm font-medium">
                Observations
              </label>
              <textarea
                id="observations"
                {...register('observations')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Project observations or special requirements..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  id="dependency"
                  type="checkbox"
                  {...register('dependency')}
                  className="rounded border-input"
                />
                <label htmlFor="dependency" className="text-sm font-medium">
                  Has Dependencies
                </label>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center">{error}</div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}