import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Department, CategoryMaster, CategoryDepartmentMapping } from '@/types';
import { categoriesApi } from '@/lib/api';

interface WorkflowStep {
  id?: string;
  department: Department;
  sequence: number;
  isRequired: boolean;
  estimatedHours?: number;
  estimatedDays?: number;
  isActive: boolean;
}

interface WorkflowBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: CategoryMaster;
}

export default function WorkflowBuilderModal({ isOpen, onClose, onSuccess, category }: WorkflowBuilderModalProps) {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      loadWorkflow();
    }
  }, [isOpen, category]);

  const loadWorkflow = async () => {
    try {
      if (category.departmentMappings && category.departmentMappings.length > 0) {
        const steps: WorkflowStep[] = category.departmentMappings
          .sort((a, b) => a.sequence - b.sequence)
          .map(mapping => ({
            id: mapping.id,
            department: mapping.department,
            sequence: mapping.sequence,
            isRequired: mapping.isRequired,
            estimatedHours: mapping.estimatedHours || undefined,
            estimatedDays: mapping.estimatedDays || undefined,
            isActive: mapping.isActive,
          }));
        setWorkflowSteps(steps);
      } else {
        // Start with a default PMO step
        const defaultDays = 7;
        setWorkflowSteps([{
          department: Department.PMO,
          sequence: 1,
          isRequired: true,
          estimatedDays: defaultDays,
          estimatedHours: defaultDays * 8, // 8 hours per day
          isActive: true,
        }]);
      }
      setHasChanges(false);
    } catch (err: any) {
      setError('Failed to load workflow');
    }
  };

  const addWorkflowStep = () => {
    const nextSequence = Math.max(...workflowSteps.map(s => s.sequence), 0) + 1;
    const defaultDays = 7;
    const newStep: WorkflowStep = {
      department: Department.DESIGN,
      sequence: nextSequence,
      isRequired: true,
      estimatedDays: defaultDays,
      estimatedHours: defaultDays * 8, // 8 hours per day
      isActive: true,
    };
    setWorkflowSteps([...workflowSteps, newStep]);
    setHasChanges(true);
  };

  const removeWorkflowStep = (index: number) => {
    const newSteps = workflowSteps.filter((_, i) => i !== index);
    // Resequence remaining steps
    const resequencedSteps = newSteps.map((step, i) => ({
      ...step,
      sequence: i + 1,
    }));
    setWorkflowSteps(resequencedSteps);
    setHasChanges(true);
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
    setHasChanges(true);
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
    setHasChanges(true);
  };

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
    setHasChanges(true);
  };

  const saveWorkflow = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Prepare data for bulk creation
      const departmentData = workflowSteps.map(step => ({
        department: step.department,
        sequence: step.sequence,
        isRequired: step.isRequired,
        estimatedHours: step.estimatedHours,
        estimatedDays: step.estimatedDays,
      }));

      await categoriesApi.bulkCreateDepartmentMappings(category.id, departmentData);
      setHasChanges(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const resetWorkflow = () => {
    if (confirm('Are you sure you want to reset the workflow to the original state?')) {
      loadWorkflow();
    }
  };

  const getDepartmentBadgeColor = (dept: Department, isRequired: boolean) => {
    if (!isRequired) return 'bg-gray-100 text-gray-700 border-gray-300';
    
    switch (dept) {
      case 'PMO': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'DESIGN': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'HTML': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'PHP': return 'bg-green-100 text-green-800 border-green-300';
      case 'REACT': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'QA': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DELIVERY': return 'bg-pink-100 text-pink-800 border-pink-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getTotalEstimate = () => {
    return {
      hours: workflowSteps.reduce((sum, step) => sum + (step.estimatedHours || 0), 0),
      days: workflowSteps.reduce((sum, step) => sum + (step.estimatedDays || 0), 0),
    };
  };

  if (!isOpen) return null;

  const totals = getTotalEstimate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workflow Builder</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure department workflow for <strong>{category.name}</strong>
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Workflow Preview */}
            <div className="bg-slate-50 border rounded-lg p-4">
              <h3 className="font-medium mb-3">Workflow Preview</h3>
              <div className="flex flex-wrap gap-2 items-center">
                {workflowSteps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <Badge 
                      className={`${getDepartmentBadgeColor(step.department, step.isRequired)} border`}
                      variant="outline"
                    >
                      {step.sequence}. {step.department}
                      {step.estimatedDays && ` (${step.estimatedDays}d)`}
                      {!step.isRequired && ' (Optional)'}
                    </Badge>
                    {index < workflowSteps.length - 1 && (
                      <span className="mx-2 text-muted-foreground">→</span>
                    )}
                  </div>
                ))}
              </div>
              {totals.days > 0 && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Total Estimated Duration: {totals.days} days
                  {totals.hours > 0 && ` (${totals.hours} hours)`}
                </div>
              )}
            </div>

            {/* Workflow Steps Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Configure Workflow Steps</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hours are automatically calculated at 8 hours per day
                  </p>
                </div>
                <Button onClick={addWorkflowStep} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Step
                </Button>
              </div>

              {workflowSteps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No workflow steps configured. Add a step to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {workflowSteps.map((step, index) => (
                    <Card key={index} className="border-2">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-12 gap-3 items-center">
                          {/* Step Number */}
                          <div className="col-span-1 text-center">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {step.sequence}
                            </Badge>
                          </div>

                          {/* Department */}
                          <div className="col-span-2">
                            <select
                              value={step.department}
                              onChange={(e) => updateWorkflowStep(index, 'department', e.target.value as Department)}
                              className="w-full h-9 rounded border border-input bg-background px-2 text-sm"
                            >
                              {Object.values(Department).map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                          </div>

                          {/* Required Toggle */}
                          <div className="col-span-2 flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={step.isRequired}
                              onChange={(e) => updateWorkflowStep(index, 'isRequired', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm">Required</span>
                          </div>

                          {/* Estimated Days */}
                          <div className="col-span-2">
                            <Input
                              type="number"
                              placeholder="Days"
                              value={step.estimatedDays || ''}
                              onChange={(e) => updateWorkflowStep(index, 'estimatedDays', e.target.value ? Number(e.target.value) : undefined)}
                              className="h-9"
                            />
                          </div>

                          {/* Estimated Hours */}
                          <div className="col-span-2">
                            <Input
                              type="number"
                              placeholder="Hours"
                              value={step.estimatedHours || ''}
                              onChange={(e) => updateWorkflowStep(index, 'estimatedHours', e.target.value ? Number(e.target.value) : undefined)}
                              className="h-9 bg-gray-50"
                            />
                          </div>

                          {/* Actions */}
                          <div className="col-span-3 flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStepUp(index)}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStepDown(index)}
                              disabled={index === workflowSteps.length - 1}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWorkflowStep(index)}
                              disabled={workflowSteps.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetWorkflow}
                  disabled={!hasChanges}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={saveWorkflow} 
                  disabled={isLoading || workflowSteps.length === 0}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isLoading ? 'Saving...' : 'Save Workflow'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}