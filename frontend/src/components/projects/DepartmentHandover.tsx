import { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Clock, ArrowRight, Upload, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentUsers, setDepartmentUsers] = useState<User[]>([]);
  const [currentChecklistProgress, setCurrentChecklistProgress] = useState<DepartmentChecklistProgress | null>(null);
  
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
      fetchDepartmentUsers(selectedDepartment);
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
    try {
      const users = await usersApi.getAll();
      const filtered = users.data.filter(user => 
        user.department === department || 
        user.role?.includes(department) ||
        user.role?.includes('TL') ||
        user.role?.includes('LEAD')
      );
      setDepartmentUsers(filtered);
    } catch (error) {
      toast.error('Failed to load department users');
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
  };

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

      {/* Handover Modal */}
      {showHandoverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Department Handover</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowHandoverModal(false);
                    resetForm();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Department Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Target Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value as Department)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select target department</option>
                  {departments.map(dept => (
                    <option key={dept.code} value={dept.code}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Assignment */}
              {selectedDepartment && (
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Assign to Team Lead / Developer
                  </label>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select team member (optional)</option>
                    {departmentUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.role?.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Timeline & Effort */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Expected Start Date
                  </label>
                  <input
                    type="date"
                    value={expectedStartDate}
                    onChange={(e) => setExpectedStartDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Expected End Date
                  </label>
                  <input
                    type="date"
                    value={expectedEndDate}
                    onChange={(e) => setExpectedEndDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Estimated Days
                  </label>
                  <input
                    type="number"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2 border rounded-md"
                    min="1"
                    placeholder="Enter estimated days"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2 border rounded-md"
                    min="1"
                    placeholder="Enter estimated hours"
                  />
                </div>
              </div>

              {/* KT Documents */}
              <div className="space-y-3">
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
                    className="flex-1 p-2 border rounded-md"
                  />
                  <Button
                    type="button"
                    onClick={addKtDocument}
                    disabled={!newKtDoc.trim()}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>

                {ktDocuments.length > 0 && (
                  <div className="space-y-2">
                    {ktDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="flex-1 text-sm truncate">{doc}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKtDocument(index)}
                        >
                          <X className="w-3 h-3" />
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
                  placeholder="Document KT sessions, key information shared, etc..."
                  className="w-full p-2 border rounded-md resize-none"
                  rows={3}
                />
              </div>

              {/* Handover Notes */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Handover Notes
                </label>
                <textarea
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="Additional notes about this handover..."
                  className="w-full p-2 border rounded-md resize-none"
                  rows={3}
                />
              </div>

              {/* Checklist Warning in Modal */}
              {!currentChecklistProgress?.canProceedToNext && currentChecklistProgress && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-900 mb-1">
                        Proceeding with Incomplete Checklist
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

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
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
                <Button
                  onClick={handleHandover}
                  disabled={!selectedDepartment || isHandingOver}
                  className={!currentChecklistProgress?.canProceedToNext ? 
                    'bg-orange-600 hover:bg-orange-700' : ''
                  }
                >
                  {isHandingOver ? 'Processing Handover...' : 
                   !currentChecklistProgress?.canProceedToNext ? 
                   'Proceed Anyway' : 'Complete Handover'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}