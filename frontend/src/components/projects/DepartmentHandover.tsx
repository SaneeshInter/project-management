import { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Clock, ArrowRight, Upload, X, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Check, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project, Department, CreateDepartmentTransitionDto, User, DepartmentChecklistProgress } from '@/types';
import { projectsApi, departmentsApi, usersApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface DepartmentHandoverProps {
  project: Project;
  onUpdate?: (updatedProject: Project) => void;
  canManageDepartments?: boolean;
}

export default function DepartmentHandover({ 
  project, 
  onUpdate, 
  canManageDepartments = false 
}: DepartmentHandoverProps) {
  const [isHandingOver, setIsHandingOver] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentUsers, setDepartmentUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentChecklistProgress, setCurrentChecklistProgress] = useState<DepartmentChecklistProgress | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Form state
  const [selectedDepartment, setSelectedDepartment] = useState<Department | ''>('');
  const [assignedToId, setAssignedToId] = useState('');
  const [expectedStartDate, setExpectedStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [estimatedDays, setEstimatedDays] = useState<number | ''>('');
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('');
  const [ktDocuments, setKtDocuments] = useState<string[]>([]);
  const [ktNotes, setKtNotes] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [newKtDoc, setNewKtDoc] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchCurrentChecklistProgress();
  }, []);

  const fetchCurrentChecklistProgress = async () => {
    try {
      const progress = await projectsApi.getChecklistProgress(project.id, project.currentDepartment);
      setCurrentChecklistProgress(progress);
    } catch (error) {
      console.warn('Could not fetch current checklist progress:', error);
    }
  };

  useEffect(() => {
    if (selectedDepartment) {
      setAssignedToId(''); // Clear previous assignment when department changes
      fetchDepartmentUsers(selectedDepartment);
    } else {
      setDepartmentUsers([]); // Clear users when no department selected
      setAssignedToId('');
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const depts = await departmentsApi.getAll();
      setDepartments(depts);
    } catch (error) {
      toast.error('Failed to load departments');
    }
  };

  const fetchDepartmentUsers = async (department: Department) => {
    setLoadingUsers(true);
    try {
      const users = await usersApi.getAll();
      console.log('All users:', users);
      console.log('Selected department:', department);
      
      // Handle both users.data and users response structures
      const userList = users.data || users;
      
      const filtered = userList.filter(user => {
        console.log('Checking user:', user.name, 'Department:', user.departmentMaster?.code, 'Role:', user.role);
        return (
          user.departmentMaster?.code === department || // Primary department match using departmentMaster
          user.department === department || // Fallback for direct department field
          user.role?.includes(`${department}_TL`) || // Department-specific team leads
          (user.role?.includes('TL') && user.departmentMaster?.code === department) || // Team leads in the department
          (user.role?.includes('LEAD') && user.departmentMaster?.code === department) // Team leads in the department
        );
      });
      
      console.log('Filtered users for department', department, ':', filtered);
      setDepartmentUsers(filtered);
    } catch (error) {
      console.error('Error fetching department users:', error);
      toast.error('Failed to load department users');
      setDepartmentUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleHandover = async () => {
    if (!selectedDepartment || !canManageDepartments) return;
    
    setIsHandingOver(true);
    try {
      const handoverData: CreateDepartmentTransitionDto = {
        toDepartment: selectedDepartment as Department,
        assignedToId: assignedToId || undefined,
        expectedStartDate: expectedStartDate || undefined,
        expectedEndDate: expectedEndDate || undefined,
        estimatedDays: estimatedDays ? Number(estimatedDays) : undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        ktDocuments: ktDocuments.length > 0 ? ktDocuments : undefined,
        ktNotes: ktNotes || undefined,
        notes: handoverNotes || undefined,
      };
      
      const updatedProject = await projectsApi.moveToDepartment(project.id, handoverData);
      toast.success(`Project handed over to ${selectedDepartment.replace('_', ' ')} successfully!`);
      onUpdate?.(updatedProject);
      setShowHandoverModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete handover');
    } finally {
      setIsHandingOver(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDepartment('');
    setAssignedToId('');
    setExpectedStartDate('');
    setExpectedEndDate('');
    setEstimatedDays('');
    setEstimatedHours('');
    setKtDocuments([]);
    setKtNotes('');
    setHandoverNotes('');
    setNewKtDoc('');
    setFormErrors({});
  };

  const validateStep = (step: number): boolean => {
    const errors: {[key: string]: string} = {};
    
    switch (step) {
      case 1:
        if (!selectedDepartment) {
          errors.selectedDepartment = 'Please select a target department';
        } else if (selectedDepartment === project.currentDepartment) {
          errors.selectedDepartment = 'Cannot handover to the same department';
        }
        break;
      case 2:
        // Date validations
        if (expectedStartDate && expectedEndDate) {
          const startDate = new Date(expectedStartDate);
          const endDate = new Date(expectedEndDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (startDate > endDate) {
            errors.dateRange = 'End date must be after start date';
          } else if (startDate < today) {
            errors.startDate = 'Start date cannot be in the past';
          }
        }
        
        // Effort validation
        if (estimatedDays && typeof estimatedDays === 'number' && estimatedDays < 1) {
          errors.estimatedDays = 'Estimated days must be at least 1';
        }
        if (estimatedHours && typeof estimatedHours === 'number' && estimatedHours < 1) {
          errors.estimatedHours = 'Estimated hours must be at least 1';
        }
        break;
      case 3:
        // Validate KT document URLs if provided
        ktDocuments.forEach((doc, index) => {
          if (doc.trim().length < 3) {
            errors[`ktDoc_${index}`] = 'Document reference too short';
          }
        });
        break;
      case 4:
        // Final validation - ensure required fields are still valid
        if (!selectedDepartment) {
          errors.selectedDepartment = 'Target department is required';
        }
        break;
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const steps = [
    { number: 1, title: 'Department & Readiness', icon: ArrowRight },
    { number: 2, title: 'Assignment & Timeline', icon: Users },
    { number: 3, title: 'Knowledge Transfer', icon: FileText },
    { number: 4, title: 'Review & Confirm', icon: CheckCircle2 },
  ];

  const addKtDocument = () => {
    if (newKtDoc.trim()) {
      setKtDocuments([...ktDocuments, newKtDoc.trim()]);
      setNewKtDoc('');
    }
  };

  const removeKtDocument = (index: number) => {
    setKtDocuments(ktDocuments.filter((_, i) => i !== index));
  };

  if (!canManageDepartments) {
    return null;
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Department Handover
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Status and Warnings */}
            <div className={`border rounded-lg p-4 ${
              currentChecklistProgress?.canProceedToNext 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentChecklistProgress?.canProceedToNext ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${
                      currentChecklistProgress?.canProceedToNext 
                        ? 'text-green-900' 
                        : 'text-orange-900'
                    }`}>
                      {currentChecklistProgress?.canProceedToNext 
                        ? 'Ready for Handover' 
                        : 'Incomplete Checklist Items'
                      }
                    </p>
                    <p className={`text-xs ${
                      currentChecklistProgress?.canProceedToNext 
                        ? 'text-green-700' 
                        : 'text-orange-700'
                    }`}>
                      {currentChecklistProgress ? (
                        `${currentChecklistProgress.completedRequiredItems}/${currentChecklistProgress.requiredItems} required items completed`
                      ) : (
                        'Checklist status unknown'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className="bg-blue-100 text-blue-800">
                    Current: {project.currentDepartment.replace('_', ' ')}
                  </Badge>
                  {currentChecklistProgress && (
                    <Badge 
                      variant={currentChecklistProgress.canProceedToNext ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {currentChecklistProgress.completedItems}/{currentChecklistProgress.totalItems} Items
                    </Badge>
                  )}
                </div>
              </div>
              
              {!currentChecklistProgress?.canProceedToNext && currentChecklistProgress && (
                <div className="mt-3 p-3 bg-orange-100 rounded border border-orange-200">
                  <p className="text-sm text-orange-800 font-medium mb-1">
                    ⚠️ Warning: Incomplete Required Items
                  </p>
                  <p className="text-xs text-orange-700">
                    {currentChecklistProgress.requiredItems - currentChecklistProgress.completedRequiredItems} required checklist items are incomplete. 
                    Consider completing these before handover to ensure smooth transition.
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowHandoverModal(true)}
              className="w-full"
              disabled={isHandingOver}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Start Department Handover
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Handover Modal */}
      {showHandoverModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="handover-modal-title"
          onClick={(e) => e.target === e.currentTarget && setShowHandoverModal(false)}
        >
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 id="handover-modal-title" className="text-2xl font-bold text-gray-900">Department Handover</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowHandoverModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                      currentStep === step.number
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : currentStep > step.number
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 text-gray-500'
                    }`}>
                      {currentStep > step.number ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-2 transition-all duration-200 ${
                        currentStep >= step.number + 1 ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">
                  Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                </p>
                <p className="text-xs text-gray-500">
                  Complete each step to handover the project successfully
                </p>
              </div>
            </div>

            {/* Modal Content - Step-based */}
            <div className="px-6 py-6">
              {/* Step 1: Department Selection & Readiness */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Select Target Department</h4>
                    <p className="text-sm text-gray-600 mb-4">Choose the department to receive this project handover.</p>
                    
                    {/* Current Status and Warnings */}
                    <div className={`border rounded-lg p-4 mb-6 ${ 
                      currentChecklistProgress?.canProceedToNext 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {currentChecklistProgress?.canProceedToNext ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${
                              currentChecklistProgress?.canProceedToNext 
                                ? 'text-green-900' 
                                : 'text-orange-900'
                            }`}>
                              {currentChecklistProgress?.canProceedToNext 
                                ? 'Ready for Handover' 
                                : 'Incomplete Checklist Items'
                              }
                            </p>
                            <p className={`text-xs ${
                              currentChecklistProgress?.canProceedToNext 
                                ? 'text-green-700' 
                                : 'text-orange-700'
                            }`}>
                              {currentChecklistProgress ? (
                                `${currentChecklistProgress.completedRequiredItems}/${currentChecklistProgress.requiredItems} required items completed`
                              ) : (
                                'Checklist status unknown'
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className="bg-blue-100 text-blue-800">
                            Current: {project.currentDepartment.replace('_', ' ')}
                          </Badge>
                          {currentChecklistProgress && (
                            <Badge 
                              variant={currentChecklistProgress.canProceedToNext ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {currentChecklistProgress.completedItems}/{currentChecklistProgress.totalItems} Items
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Department Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Target Department *
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {departments
                          .filter(dept => dept.code !== project.currentDepartment)
                          .map(dept => (
                          <div
                            key={dept.code}
                            onClick={() => setSelectedDepartment(dept.code as Department)}
                            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedDepartment === dept.code
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : formErrors.selectedDepartment
                                ? 'border-red-200 hover:border-red-300'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 mb-1">{dept.name}</h5>
                                <p className="text-xs text-gray-600 mb-2">Code: {dept.code}</p>
                                {dept.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2">{dept.description}</p>
                                )}
                              </div>
                              
                              {/* Selection indicator */}
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                selectedDepartment === dept.code
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {selectedDepartment === dept.code && (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </div>
                            
                            {/* Status indicator */}
                            <div className="mt-2 flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                dept.isActive ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                              <span className="text-xs text-gray-500">
                                {dept.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {departments.filter(dept => dept.code !== project.currentDepartment).length === 0 && (
                        <div className="text-center p-8 text-gray-500">
                          <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">No other departments available for handover</p>
                        </div>
                      )}
                      
                      {formErrors.selectedDepartment && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {formErrors.selectedDepartment}
                        </p>
                      )}
                    </div>

                    {/* Warning for incomplete checklist */}
                    {!currentChecklistProgress?.canProceedToNext && currentChecklistProgress && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-orange-900 mb-1">
                              ⚠️ Warning: Incomplete Required Items
                            </p>
                            <p className="text-xs text-orange-700 mb-2">
                              {currentChecklistProgress.requiredItems - currentChecklistProgress.completedRequiredItems} required checklist items are incomplete. 
                              Consider completing these before handover to ensure smooth transition.
                            </p>
                            <p className="text-xs text-orange-600 font-medium">
                              You can still proceed, but the receiving department may face issues.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Assignment & Timeline */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Assignment & Timeline</h4>
                    <p className="text-sm text-gray-600 mb-6">Assign team members and set timeline expectations for the handover.</p>
                    
                    {/* User Assignment */}
                    {selectedDepartment && (
                      <div className="space-y-4 mb-6">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Assign to Team Lead / Developer
                          {loadingUsers && (
                            <span className="text-xs text-gray-500">(Loading users...)</span>
                          )}
                        </label>
                        
                        {loadingUsers ? (
                          <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                            <div className="flex items-center gap-2 text-gray-500">
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                              <span className="text-sm">Loading users for {departments.find(d => d.code === selectedDepartment)?.name}...</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <select
                              value={assignedToId}
                              onChange={(e) => setAssignedToId(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              disabled={departmentUsers.length === 0}
                            >
                              <option value="">Select team member (optional)</option>
                              {departmentUsers.map(user => (
                                <option key={user.id} value={user.id}>
                                  {user.name} - {user.role?.replace('_', ' ')} {user.email && `(${user.email})`}
                                </option>
                              ))}
                            </select>
                            
                            {departmentUsers.length === 0 && !loadingUsers && (
                              <div className="text-center p-4 text-gray-500 bg-gray-50 rounded-lg">
                                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No users found for {departments.find(d => d.code === selectedDepartment)?.name} department</p>
                                <p className="text-xs mt-1">Try selecting a different department or check if users are assigned to this department.</p>
                              </div>
                            )}
                            
                            {departmentUsers.length > 0 && (
                              <p className="text-xs text-gray-600">
                                Found {departmentUsers.length} user{departmentUsers.length !== 1 ? 's' : ''} in {departments.find(d => d.code === selectedDepartment)?.name} department
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Timeline
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Expected Start Date
                          </label>
                          <input
                            type="date"
                            value={expectedStartDate}
                            onChange={(e) => setExpectedStartDate(e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              formErrors.startDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {formErrors.startDate && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Expected End Date
                          </label>
                          <input
                            type="date"
                            value={expectedEndDate}
                            onChange={(e) => setExpectedEndDate(e.target.value)}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              formErrors.dateRange ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {formErrors.dateRange && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.dateRange}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Effort Estimation */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Effort Estimation
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Estimated Days
                          </label>
                          <input
                            type="number"
                            value={estimatedDays}
                            onChange={(e) => setEstimatedDays(e.target.value ? Number(e.target.value) : '')}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              formErrors.estimatedDays ? 'border-red-500' : 'border-gray-300'
                            }`}
                            min="1"
                            placeholder="Enter estimated days"
                          />
                          {formErrors.estimatedDays && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.estimatedDays}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Estimated Hours
                          </label>
                          <input
                            type="number"
                            value={estimatedHours}
                            onChange={(e) => setEstimatedHours(e.target.value ? Number(e.target.value) : '')}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              formErrors.estimatedHours ? 'border-red-500' : 'border-gray-300'
                            }`}
                            min="1"
                            placeholder="Enter estimated hours"
                          />
                          {formErrors.estimatedHours && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.estimatedHours}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Knowledge Transfer */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Knowledge Transfer</h4>
                    <p className="text-sm text-gray-600 mb-6">Document and share relevant information, files, and notes for the receiving team.</p>
                    
                    {/* KT Documents */}
                    <div className="space-y-4 mb-6">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Knowledge Transfer Documents
                      </label>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newKtDoc}
                          onChange={(e) => setNewKtDoc(e.target.value)}
                          placeholder="Enter document URL or path"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && addKtDocument()}
                        />
                        <Button
                          type="button"
                          onClick={addKtDocument}
                          disabled={!newKtDoc.trim()}
                        >
                          Add
                        </Button>
                      </div>

                      {ktDocuments.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {ktDocuments.map((doc, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                              <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                              <span className="flex-1 text-sm truncate">{doc}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeKtDocument(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* KT Notes */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        Knowledge Transfer Notes
                      </label>
                      <textarea
                        value={ktNotes}
                        onChange={(e) => setKtNotes(e.target.value)}
                        placeholder="Document KT sessions, key information shared, technical details, dependencies, etc..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    </div>

                    {/* Handover Notes */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        Additional Handover Notes
                      </label>
                      <textarea
                        value={handoverNotes}
                        onChange={(e) => setHandoverNotes(e.target.value)}
                        placeholder="Any additional context, special requirements, or important information for the receiving team..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Confirm */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Review & Confirm Handover</h4>
                    <p className="text-sm text-gray-600 mb-6">Review all details before completing the handover process.</p>
                    
                    {/* Summary Cards */}
                    <div className="space-y-4">
                      {/* Department & Assignment */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">Department & Assignment</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">From Department:</span>
                            <span className="font-medium">{project.currentDepartment.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">To Department:</span>
                            <span className="font-medium">
                              {departments.find(d => d.code === selectedDepartment)?.name || 'N/A'}
                            </span>
                          </div>
                          {assignedToId && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Assigned To:</span>
                              <span className="font-medium">
                                {departmentUsers.find(u => u.id === assignedToId)?.name || 'N/A'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timeline & Effort */}
                      {(expectedStartDate || expectedEndDate || estimatedDays || estimatedHours) && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-3">Timeline & Effort</h5>
                          <div className="space-y-2 text-sm">
                            {expectedStartDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Expected Start:</span>
                                <span className="font-medium">{new Date(expectedStartDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {expectedEndDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Expected End:</span>
                                <span className="font-medium">{new Date(expectedEndDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {estimatedDays && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Estimated Days:</span>
                                <span className="font-medium">{estimatedDays}</span>
                              </div>
                            )}
                            {estimatedHours && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Estimated Hours:</span>
                                <span className="font-medium">{estimatedHours}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Knowledge Transfer */}
                      {(ktDocuments.length > 0 || ktNotes || handoverNotes) && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-3">Knowledge Transfer</h5>
                          <div className="space-y-3 text-sm">
                            {ktDocuments.length > 0 && (
                              <div>
                                <span className="text-gray-600 block mb-1">Documents ({ktDocuments.length}):</span>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {ktDocuments.map((doc, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs text-gray-700">
                                      <FileText className="w-3 h-3" />
                                      <span className="truncate">{doc}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {ktNotes && (
                              <div>
                                <span className="text-gray-600 block mb-1">KT Notes:</span>
                                <p className="text-gray-700 text-xs bg-white p-2 rounded border max-h-20 overflow-y-auto">{ktNotes}</p>
                              </div>
                            )}
                            {handoverNotes && (
                              <div>
                                <span className="text-gray-600 block mb-1">Handover Notes:</span>
                                <p className="text-gray-700 text-xs bg-white p-2 rounded border max-h-20 overflow-y-auto">{handoverNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Final Checklist Warning */}
                    {!currentChecklistProgress?.canProceedToNext && currentChecklistProgress && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-orange-900 mb-1">
                              Final Warning: Incomplete Checklist
                            </p>
                            <p className="text-xs text-orange-700 mb-2">
                              {currentChecklistProgress.requiredItems - currentChecklistProgress.completedRequiredItems} required items are not completed. 
                              This may cause issues for the receiving department.
                            </p>
                            <p className="text-xs text-orange-600 font-medium">
                              Are you sure you want to proceed with the handover?
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-xl">
              <div className="flex gap-3 justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowHandoverModal(false);
                      resetForm();
                    }}
                    disabled={isHandingOver}
                  >
                    Cancel
                  </Button>
                  
                  {currentStep < 4 ? (
                    <Button
                      onClick={nextStep}
                      className="flex items-center gap-2"
                      disabled={currentStep === 1 && !selectedDepartment}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleHandover}
                      disabled={!selectedDepartment || isHandingOver}
                      className={`flex items-center gap-2 ${!currentChecklistProgress?.canProceedToNext ? 
                        'bg-orange-600 hover:bg-orange-700' : ''
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isHandingOver ? 'Processing...' : 
                       !currentChecklistProgress?.canProceedToNext ? 
                       'Proceed Anyway' : 'Complete Handover'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}