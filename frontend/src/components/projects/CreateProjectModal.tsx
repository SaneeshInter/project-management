import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useProjectsStore } from '@/stores/projects';
import { CreateProjectDto, ProjectStatus, Office, User, CategoryMaster, Department } from '@/types';
import { usersApi, categoriesApi } from '@/lib/api';

// Validation schema for step 1
const step1Schema = z.object({
  name: z.string().min(1, 'Project name is required'),
  office: z.string().min(1, 'Office is required'),
  categoryMasterId: z.string().min(1, 'Category is required'),
  salesPersonId: z.string().min(1, 'Sales person is required'),
  clientName: z.string().min(1, 'Client name is required'),
});

// Validation schema for step 2
const step2Schema = z.object({
  projectCoordinatorId: z.string().min(1, 'Project Coordinator is required'),
  pcTeamLeadId: z.string().optional(),
});

// Full form schema
const createProjectSchema = step1Schema.extend({
  // PC Assignment fields
  projectCoordinatorId: z.string().min(1, 'Project Coordinator is required'),
  pcTeamLeadId: z.string().optional(),
  // KT Meeting fields
  scheduleKTMeeting: z.boolean().optional(),
  ktMeetingDate: z.string().optional(),
  ktMeetingDuration: z.number().optional(),
  ktMeetingAgenda: z.string().optional(),
  ktMeetingLink: z.string().optional(),
  ktMeetingParticipants: z.array(z.string()).optional(),
});

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { createProject, isLoading } = useProjectsStore();
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState(1);
  const [salesPersons, setSalesPersons] = useState<User[]>([]);
  const [loadingSalesPersons, setLoadingSalesPersons] = useState(false);
  const [categories, setCategories] = useState<CategoryMaster[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [projectCoordinators, setProjectCoordinators] = useState<User[]>([]);
  const [pcTeamLeads, setPcTeamLeads] = useState<User[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<User[]>([]);
  const [loadingPcUsers, setLoadingPcUsers] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
    reset,
  } = useForm<CreateProjectDto>({
    mode: 'onChange',
    defaultValues: {
      office: 'KOCHI',
      scheduleKTMeeting: false,
      ktMeetingDuration: 60,
    },
  });

  const watchScheduleKTMeeting = watch('scheduleKTMeeting');


  // Fetch sales persons, categories, and PC users
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      
      setLoadingSalesPersons(true);
      setLoadingCategories(true);
      setLoadingPcUsers(true);
      
      try {
        // Get all users
        const usersData = await usersApi.getAll();
        
        // Filter sales persons
        const salesUsers = usersData.data.filter(user => 
          user.department === Department.SALES_EXE || user.departmentMaster?.code === 'SALES_EXE'
        );
        setSalesPersons(salesUsers);
        
        // Filter project coordinators (PMO department with PC role)
        const pcUsers = usersData.data.filter(user => 
          (user.department === Department.PMO || user.departmentMaster?.code === 'PMO') &&
          (user.role === 'PROJECT_COORDINATOR' || user.roleMaster?.code === 'PROJECT_COORDINATOR' || user.role === 'PC')
        );
        setProjectCoordinators(pcUsers);
        
        // Filter PC team leads (PMO department with PC_TL roles)
        const pcTlUsers = usersData.data.filter(user => 
          (user.department === Department.PMO || user.departmentMaster?.code === 'PMO') &&
          (user.roleMaster?.code === 'PC_TL1' || user.roleMaster?.code === 'PC_TL2')
        );
        setPcTeamLeads(pcTlUsers);
        
        // Filter team leaders across all departments
        const tlUsers = usersData.data.filter(user => 
          user.roleMaster?.code?.includes('_TL') || 
          user.role?.toString().includes('_TL')
        );
        setTeamLeaders(tlUsers);
        
        // Get all active categories
        const categoryData = await categoriesApi.getAll();
        setCategories(categoryData.filter(cat => cat.isActive));
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoadingSalesPersons(false);
        setLoadingCategories(false);
        setLoadingPcUsers(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Step navigation functions
  const nextStep = async () => {
    let isValid = true;
    
    // Validate current step before moving to next
    if (step === 1) {
      const values = getValues();
      const result = step1Schema.safeParse(values);
      if (!result.success) {
        // Set field errors
        result.error.errors.forEach((error) => {
          if (error.path[0]) {
            // This is a simple way to trigger validation errors
            trigger(error.path[0] as keyof CreateProjectDto);
          }
        });
        isValid = false;
      }
    } else if (step === 2) {
      const values = getValues();
      const result = step2Schema.safeParse(values);
      if (!result.success) {
        result.error.errors.forEach((error) => {
          if (error.path[0]) {
            trigger(error.path[0] as keyof CreateProjectDto);
          }
        });
        isValid = false;
      }
    }
    
    if (isValid) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => setStep(step - 1);

  const resetModal = () => {
    setStep(1);
    setError('');
    reset();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const onSubmit = async (data: CreateProjectDto) => {
    try {
      setError('');
      
      // Final validation
      const result = createProjectSchema.safeParse(data);
      if (!result.success) {
        setError('Please fill in all required fields correctly');
        return;
      }
      
      // Add default values for required backend fields
      const formattedData: CreateProjectDto = {
        ...data,
        status: ProjectStatus.ACTIVE,
        // Set a default target date (can be updated later)
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        // Remove category field - we only use categoryMasterId
        category: undefined,
        // Format KT meeting data
        ktMeetingParticipants: data.ktMeetingParticipants?.filter((id: string) => id.trim() !== '') || [],
      };
      
      await createProject(formattedData);
      resetModal();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  if (!isOpen) return null;

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
        }`}>1</div>
        <div className="w-8 h-0.5 bg-gray-200">
          <div className={`h-full transition-all duration-300 ${
            step >= 2 ? 'bg-blue-500 w-full' : 'bg-gray-200 w-0'
          }`} />
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
        }`}>2</div>
        <div className="w-8 h-0.5 bg-gray-200">
          <div className={`h-full transition-all duration-300 ${
            step >= 3 ? 'bg-blue-500 w-full' : 'bg-gray-200 w-0'
          }`} />
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
        }`}>3</div>
      </div>
      <div className="text-xs text-gray-500 mt-2 ml-4">
        {step === 1 && 'Project Details'}
        {step === 2 && 'PC Assignment'}
        {step === 3 && 'KT Meeting (Optional)'}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Project - Step {step} of 3</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          {renderStepIndicator()}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Project Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Project Name *
                    </label>
                    <Input
                      id="name"
                      {...register('name')}
                      className={errors.name ? 'border-red-500' : ''}
                      placeholder="Enter project name"
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
                    <label htmlFor="categoryMasterId" className="text-sm font-medium">
                      Project Category *
                    </label>
                    <select
                      id="categoryMasterId"
                      {...register('categoryMasterId')}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.categoryMasterId ? 'border-red-500' : ''}`}
                      disabled={loadingCategories}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryMasterId && (
                      <p className="text-sm text-red-500">{errors.categoryMasterId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="salesPersonId" className="text-sm font-medium">
                      Sales Person *
                    </label>
                    <select
                      id="salesPersonId"
                      {...register('salesPersonId')}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.salesPersonId ? 'border-red-500' : ''}`}
                      disabled={loadingSalesPersons}
                    >
                      <option value="">Select Sales Person</option>
                      {salesPersons.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                    {errors.salesPersonId && (
                      <p className="text-sm text-red-500">{errors.salesPersonId.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="clientName" className="text-sm font-medium">
                    Client Name *
                  </label>
                  <Input
                    id="clientName"
                    {...register('clientName')}
                    className={errors.clientName ? 'border-red-500' : ''}
                    placeholder="Enter client name"
                  />
                  {errors.clientName && (
                    <p className="text-sm text-red-500">{errors.clientName.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: PC Assignment */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Coordinator Assignment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="projectCoordinatorId" className="text-sm font-medium">
                      Project Coordinator *
                    </label>
                    <select
                      id="projectCoordinatorId"
                      {...register('projectCoordinatorId')}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errors.projectCoordinatorId ? 'border-red-500' : ''}`}
                      disabled={loadingPcUsers}
                    >
                      <option value="">Select Project Coordinator</option>
                      {projectCoordinators.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                    {errors.projectCoordinatorId && (
                      <p className="text-sm text-red-500">{errors.projectCoordinatorId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="pcTeamLeadId" className="text-sm font-medium">
                      PC Team Lead (Optional)
                    </label>
                    <select
                      id="pcTeamLeadId"
                      {...register('pcTeamLeadId')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={loadingPcUsers}
                    >
                      <option value="">Select PC Team Lead (Optional)</option>
                      {pcTeamLeads.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">PC Assignment Information</h4>
                  <p className="text-sm text-blue-700">
                    The Project Coordinator will be responsible for managing the project workflow and ensuring smooth transitions between departments.
                    The PC Team Lead is optional and can provide additional oversight and support.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: KT Meeting */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Knowledge Transfer Meeting (Optional)</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="scheduleKTMeeting"
                    checked={!!watchScheduleKTMeeting}
                    onCheckedChange={(checked) => setValue('scheduleKTMeeting', !!checked)}
                  />
                  <label htmlFor="scheduleKTMeeting" className="text-sm font-medium">
                    Schedule KT Meeting
                  </label>
                </div>

                {watchScheduleKTMeeting && (
                  <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="ktMeetingDate" className="text-sm font-medium">
                          Meeting Date & Time *
                        </label>
                        <Input
                          id="ktMeetingDate"
                          type="datetime-local"
                          {...register('ktMeetingDate')}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="ktMeetingDuration" className="text-sm font-medium">
                          Duration (minutes)
                        </label>
                        <Input
                          id="ktMeetingDuration"
                          type="number"
                          {...register('ktMeetingDuration', { valueAsNumber: true })}
                          placeholder="60"
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="ktMeetingAgenda" className="text-sm font-medium">
                        Meeting Agenda
                      </label>
                      <Textarea
                        id="ktMeetingAgenda"
                        {...register('ktMeetingAgenda')}
                        placeholder="Knowledge transfer session covering project requirements, workflow, and expectations..."
                        className="text-sm"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="ktMeetingLink" className="text-sm font-medium">
                        Meeting Link (Optional)
                      </label>
                      <Input
                        id="ktMeetingLink"
                        {...register('ktMeetingLink')}
                        placeholder="https://meet.google.com/..."
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Additional Participants (Optional)
                      </label>
                      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                        {teamLeaders.map((user) => (
                          <label key={user.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              value={user.id}
                              {...register('ktMeetingParticipants')}
                              className="rounded"
                            />
                            <span className="text-sm">
                              {user.name} ({user.roleMaster?.name || user.role}) - {user.departmentMaster?.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-2">KT Meeting Benefits</h4>
                  <p className="text-sm text-green-700">
                    Scheduling a KT meeting ensures that all stakeholders understand the project requirements, 
                    workflow expectations, and deliverables. This helps prevent misunderstandings and ensures 
                    smooth project execution.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <div>
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                
                {step < 3 ? (
                  <Button type="button" onClick={() => nextStep()}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isLoading || loadingCategories || loadingSalesPersons || loadingPcUsers}
                  >
                    {isLoading ? 'Creating Project...' : 'Create Project'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}