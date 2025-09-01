import { useState } from 'react';
import { X, Upload, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  ParsedEmployeeData, 
  ImportValidation, 
  ImportOptions,
  ImportResult,
  Department 
} from '@/types';
import CSVUploadZone from './CSVUploadZone';
import ImportPreviewTable from './ImportPreviewTable';
import DepartmentResolutionModal from './DepartmentResolutionModal';
import { CSVImportService } from '@/lib/csvUtils';
import { toast } from 'sonner';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (result: ImportResult) => void;
}

type ImportStep = 'upload' | 'preview' | 'import' | 'complete';

export default function CSVImportModal({
  isOpen,
  onClose,
  onImportSuccess
}: CSVImportModalProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedEmployeeData[]>([]);
  const [validation, setValidation] = useState<ImportValidation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    createMissingDepartments: true,
    defaultDepartment: undefined,
    departmentMapping: {},
    skipInvalidRows: false,
    generateEmails: true,
    emailDomain: 'company.com'
  });

  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setIsLoading(true);

    try {
      const parseResult = await CSVImportService.parseCSVFile(file);
      setParsedData(parseResult.data);
      setValidation(parseResult.validation);
      
      if (parseResult.data.length === 0) {
        setError('No valid employee data found in CSV file');
        return;
      }

      setCurrentStep('preview');
      
      if (parseResult.validation.departmentConflicts.length > 0) {
        toast.warning(`Found ${parseResult.validation.departmentConflicts.length} department conflicts that need resolution`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setParsedData([]);
    setValidation(null);
    setError(null);
    setCurrentStep('upload');
  };

  const handleDepartmentResolution = () => {
    setShowResolutionModal(true);
  };

  const handleDepartmentResolutionComplete = (resolutions: Record<string, Department | 'CREATE_NEW' | 'SKIP'>) => {
    // Update the validation with resolved conflicts
    if (validation) {
      const updatedConflicts = validation.departmentConflicts.map(conflict => ({
        ...conflict,
        resolved: true,
        resolution: resolutions[conflict.csvName]
      }));
      
      setValidation({
        ...validation,
        departmentConflicts: updatedConflicts,
        isValid: validation.errors.length === 0 && Object.values(resolutions).every(r => r !== 'SKIP')
      });
    }
    
    setShowResolutionModal(false);
    toast.success('Department conflicts resolved');
  };

  const handleStartImport = async () => {
    if (!parsedData.length || !validation) return;

    setIsLoading(true);
    setCurrentStep('import');

    try {
      // Mock project data - in real implementation, fetch from API
      const existingProjects = [
        { id: '1', name: 'Project A' },
        { id: '2', name: 'Project B' },
        { id: '3', name: 'Project C' },
      ];

      const result = await CSVImportService.processImport(
        parsedData,
        validation,
        importOptions,
        existingProjects
      );

      setImportResult(result);
      setCurrentStep('complete');
      
      if (result.success) {
        toast.success(`Successfully imported ${result.successCount} employees`);
        onImportSuccess(result);
      } else {
        toast.error(`Import completed with ${result.failureCount} errors`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setCurrentStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToImport = validation?.isValid && 
    (validation.departmentConflicts.length === 0 || 
     validation.departmentConflicts.every(c => c.resolved));

  const handleClose = () => {
    setSelectedFile(null);
    setParsedData([]);
    setValidation(null);
    setError(null);
    setCurrentStep('upload');
    setImportResult(null);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <CSVUploadZone
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            selectedFile={selectedFile}
            isLoading={isLoading}
            error={error}
          />
        );

      case 'preview':
        return validation && (
          <div className="space-y-6">
            <ImportPreviewTable
              data={parsedData}
              validation={validation}
              onDepartmentResolution={handleDepartmentResolution}
            />
            
            {/* Import Options */}
            <Card>
              <CardHeader>
                <CardTitle>Import Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipInvalidRows"
                    checked={importOptions.skipInvalidRows}
                    onCheckedChange={(checked) =>
                      setImportOptions(prev => ({ ...prev, skipInvalidRows: checked as boolean }))
                    }
                  />
                  <label htmlFor="skipInvalidRows" className="text-sm font-medium">
                    Skip rows with errors instead of failing import
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generateEmails"
                    checked={importOptions.generateEmails}
                    onCheckedChange={(checked) =>
                      setImportOptions(prev => ({ ...prev, generateEmails: checked as boolean }))
                    }
                  />
                  <label htmlFor="generateEmails" className="text-sm font-medium">
                    Generate email addresses for employees without emails
                  </label>
                </div>
                
                {importOptions.generateEmails && (
                  <div className="ml-6 space-y-2">
                    <label htmlFor="emailDomain" className="text-sm font-medium">
                      Email domain:
                    </label>
                    <Input
                      id="emailDomain"
                      value={importOptions.emailDomain}
                      onChange={(e) =>
                        setImportOptions(prev => ({ ...prev, emailDomain: e.target.value }))
                      }
                      placeholder="company.com"
                      className="max-w-xs"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'import':
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Importing Employees...</h3>
            <p className="text-muted-foreground">
              Please wait while we process your employee data.
            </p>
          </div>
        );

      case 'complete':
        return importResult && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                importResult.success ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {importResult.success ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {importResult.success ? 'Import Completed!' : 'Import Completed with Issues'}
              </h3>
              <p className="text-muted-foreground">
                {importResult.successCount} employees imported successfully
                {importResult.failureCount > 0 && `, ${importResult.failureCount} failed`}
              </p>
            </div>

            {/* Import Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{importResult.successCount}</div>
                  <div className="text-sm text-green-700">Imported</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{importResult.summary.departmentsCreated}</div>
                  <div className="text-sm text-blue-700">Departments Created</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{importResult.summary.projectAssignments}</div>
                  <div className="text-sm text-purple-700">Project Assignments</div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{importResult.failureCount}</div>
                  <div className="text-sm text-red-700">Errors</div>
                </CardContent>
              </Card>
            </div>

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Import Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                        <strong>Row {error.row}:</strong> {error.message}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'upload':
        return 'Upload CSV File';
      case 'preview':
        return 'Preview & Validate';
      case 'import':
        return 'Importing...';
      case 'complete':
        return 'Import Complete';
      default:
        return 'Import Employees';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {getStepTitle()}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mt-4">
              {['upload', 'preview', 'import', 'complete'].map((step, index) => {
                const isActive = currentStep === step;
                const isCompleted = ['upload', 'preview', 'import', 'complete'].indexOf(currentStep) > index;
                
                return (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive ? 'bg-blue-600 text-white' :
                      isCompleted ? 'bg-green-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    {index < 3 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardHeader>

          <CardContent>
            {renderStepContent()}
          </CardContent>

          {/* Footer Actions */}
          {currentStep !== 'import' && (
            <div className="flex justify-between items-center p-6 border-t">
              <div>
                {currentStep === 'preview' && validation && (
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">
                      {parsedData.length} employees
                    </Badge>
                    {!validation.isValid && (
                      <Badge variant="destructive">
                        {validation.errors.length} errors
                      </Badge>
                    )}
                    {validation.departmentConflicts.length > 0 && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        {validation.departmentConflicts.length} conflicts
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose}>
                  {currentStep === 'complete' ? 'Close' : 'Cancel'}
                </Button>
                
                {currentStep === 'preview' && (
                  <Button
                    onClick={handleStartImport}
                    disabled={!canProceedToImport || isLoading}
                  >
                    Import {parsedData.length} Employees
                  </Button>
                )}
                
                {currentStep === 'upload' && selectedFile && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('preview')}
                    disabled={isLoading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Department Resolution Modal */}
      {showResolutionModal && validation && (
        <DepartmentResolutionModal
          isOpen={showResolutionModal}
          onClose={() => setShowResolutionModal(false)}
          conflicts={validation.departmentConflicts}
          onResolve={handleDepartmentResolutionComplete}
          importOptions={importOptions}
          onOptionsChange={setImportOptions}
        />
      )}
    </>
  );
}