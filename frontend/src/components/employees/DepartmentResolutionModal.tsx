import { useState, useEffect } from 'react';
import { X, Building2, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DepartmentConflict, 
  Department,
  ImportOptions 
} from '@/types';
import { departmentUtils } from '@/lib/employeeUtils';

interface DepartmentResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: DepartmentConflict[];
  onResolve: (resolutions: Record<string, Department | 'CREATE_NEW' | 'SKIP'>) => void;
  importOptions: ImportOptions;
  onOptionsChange: (options: ImportOptions) => void;
}

export default function DepartmentResolutionModal({
  isOpen,
  onClose,
  conflicts,
  onResolve,
  importOptions,
  onOptionsChange
}: DepartmentResolutionModalProps) {
  const [resolutions, setResolutions] = useState<Record<string, Department | 'CREATE_NEW' | 'SKIP'>>({});
  const [newDepartmentNames, setNewDepartmentNames] = useState<Record<string, string>>({});
  const [defaultDepartment, setDefaultDepartment] = useState<Department | ''>('');

  useEffect(() => {
    // Initialize resolutions with suggestions
    const initialResolutions: Record<string, Department | 'CREATE_NEW' | 'SKIP'> = {};
    conflicts.forEach(conflict => {
      if (conflict.suggestion) {
        initialResolutions[conflict.csvName] = conflict.suggestion;
      } else {
        initialResolutions[conflict.csvName] = 'CREATE_NEW';
      }
    });
    setResolutions(initialResolutions);
  }, [conflicts]);

  const handleResolutionChange = (csvName: string, resolution: Department | 'CREATE_NEW' | 'SKIP') => {
    setResolutions(prev => ({
      ...prev,
      [csvName]: resolution
    }));
  };

  const handleNewDepartmentNameChange = (csvName: string, name: string) => {
    setNewDepartmentNames(prev => ({
      ...prev,
      [csvName]: name
    }));
  };

  const handleResolve = () => {
    // Update import options with default department
    if (defaultDepartment) {
      onOptionsChange({
        ...importOptions,
        defaultDepartment: defaultDepartment as Department,
        createMissingDepartments: Object.values(resolutions).includes('CREATE_NEW')
      });
    }

    onResolve(resolutions);
    onClose();
  };

  const getResolutionIcon = (resolution: Department | 'CREATE_NEW' | 'SKIP') => {
    switch (resolution) {
      case 'CREATE_NEW':
        return <Plus className="h-4 w-4 text-blue-600" />;
      case 'SKIP':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getResolutionColor = (resolution: Department | 'CREATE_NEW' | 'SKIP') => {
    switch (resolution) {
      case 'CREATE_NEW':
        return 'bg-blue-50 border-blue-200';
      case 'SKIP':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const unresolved = conflicts.filter(c => !resolutions[c.csvName] || resolutions[c.csvName] === 'SKIP');
  const toCreate = conflicts.filter(c => resolutions[c.csvName] === 'CREATE_NEW');
  const mapped = conflicts.filter(c => resolutions[c.csvName] && !['CREATE_NEW', 'SKIP'].includes(resolutions[c.csvName] as string));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Resolve Department Conflicts
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            The following departments from your CSV file don't exist in the system. 
            Choose how to handle each one.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{toCreate.length}</div>
                <div className="text-sm text-blue-700">To Create</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{mapped.length}</div>
                <div className="text-sm text-green-700">Mapped</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{unresolved.length}</div>
                <div className="text-sm text-red-700">To Skip</div>
              </CardContent>
            </Card>
          </div>

          {/* Default Department Option */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Default Department (Optional)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Assign a default department for employees without a specified department
              </p>
            </CardHeader>
            <CardContent>
              <select
                value={defaultDepartment}
                onChange={(e) => setDefaultDepartment(e.target.value as Department | '')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No default department</option>
                {Object.values(Department).map(dept => (
                  <option key={dept} value={dept}>
                    {departmentUtils.formatDepartmentName(dept)}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Department Conflicts */}
          <div className="space-y-4">
            <h3 className="font-semibold">Department Conflicts ({conflicts.length})</h3>
            
            {conflicts.map((conflict, index) => {
              const currentResolution = resolutions[conflict.csvName];
              
              return (
                <Card key={index} className={`transition-all duration-200 ${getResolutionColor(currentResolution)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            CSV: "{conflict.csvName}"
                          </Badge>
                          {getResolutionIcon(currentResolution)}
                        </div>
                        {conflict.suggestion && (
                          <div className="text-sm text-muted-foreground">
                            Suggested: {departmentUtils.formatDepartmentName(conflict.suggestion)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resolution Options */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Choose resolution:</div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Map to Existing */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Map to existing department:</label>
                          <select
                            value={Object.values(Department).includes(currentResolution as Department) ? currentResolution : ''}
                            onChange={(e) => handleResolutionChange(conflict.csvName, e.target.value as Department)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          >
                            <option value="">Select department...</option>
                            {Object.values(Department).map(dept => (
                              <option key={dept} value={dept}>
                                {departmentUtils.formatDepartmentName(dept)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Create New */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Create new department:</label>
                          <div className="space-y-1">
                            <Button
                              variant={currentResolution === 'CREATE_NEW' ? 'default' : 'outline'}
                              size="sm"
                              className="w-full"
                              onClick={() => handleResolutionChange(conflict.csvName, 'CREATE_NEW')}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Create "{conflict.csvName}"
                            </Button>
                            {currentResolution === 'CREATE_NEW' && (
                              <Input
                                placeholder="Department name"
                                value={newDepartmentNames[conflict.csvName] || conflict.csvName}
                                onChange={(e) => handleNewDepartmentNameChange(conflict.csvName, e.target.value)}
                                className="text-sm"
                              />
                            )}
                          </div>
                        </div>

                        {/* Skip */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Skip employees:</label>
                          <Button
                            variant={currentResolution === 'SKIP' ? 'destructive' : 'outline'}
                            size="sm"
                            className="w-full"
                            onClick={() => handleResolutionChange(conflict.csvName, 'SKIP')}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Skip Department
                          </Button>
                        </div>
                      </div>

                      {/* Similar Departments */}
                      {conflict.possibleMatches.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">Similar departments:</div>
                          <div className="flex flex-wrap gap-1">
                            {conflict.possibleMatches.map((match, matchIndex) => (
                              <Button
                                key={matchIndex}
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleResolutionChange(conflict.csvName, match)}
                              >
                                {departmentUtils.formatDepartmentName(match)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleResolve}
              disabled={conflicts.some(c => !resolutions[c.csvName])}
            >
              Apply Resolutions ({Object.keys(resolutions).length}/{conflicts.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}