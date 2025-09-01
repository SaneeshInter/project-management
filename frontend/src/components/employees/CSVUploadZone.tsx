import { useCallback, useState } from 'react';
import { Upload, FileText, X, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CSVImportService, fileUtils } from '@/lib/csvUtils';

interface CSVUploadZoneProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File | null;
  isLoading?: boolean;
  error?: string | null;
}

export default function CSVUploadZone({
  onFileSelect,
  onFileRemove,
  selectedFile,
  isLoading = false,
  error = null
}: CSVUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    setValidationError(null);
    
    const validation = CSVImportService.validateFileFormat(file);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid file format');
      return;
    }
    
    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    CSVImportService.downloadCSVTemplate();
  };

  const handleRemoveFile = () => {
    setValidationError(null);
    onFileRemove();
  };

  return (
    <div className="space-y-4">
      {/* Download Template Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Import Employees from CSV</h3>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file containing employee data
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Upload Zone */}
      {!selectedFile ? (
        <Card
          className={`relative border-2 border-dashed transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : error || validationError
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <CardContent
            className="flex flex-col items-center justify-center py-12 px-6 text-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="mb-4">
              <Upload
                className={`h-12 w-12 mx-auto ${
                  dragActive ? 'text-blue-500' : 'text-gray-400'
                }`}
              />
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-lg font-medium">
                {dragActive ? 'Drop your CSV file here' : 'Drag and drop your CSV file'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse and select a file
              </p>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => document.getElementById('csv-file-input')?.click()}
              >
                {isLoading ? 'Processing...' : 'Select File'}
              </Button>
              
              <input
                id="csv-file-input"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isLoading}
              />
            </div>

            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              <p>Supported format: CSV</p>
              <p>Maximum file size: 5MB</p>
            </div>

            {/* Error Display */}
            {(error || validationError) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {error || validationError}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Selected File Display
        <Card className="border-green-300 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-green-900">{selectedFile.name}</div>
                  <div className="text-sm text-green-700">
                    {fileUtils.formatFileSize(selectedFile.size)} • CSV File
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Ready to import
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isLoading}
                  className="text-green-700 hover:text-green-900"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          CSV Format Requirements
        </h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p>• <strong>Required columns:</strong> Name, Status, Role</p>
          <p>• <strong>Optional columns:</strong> Department, Date added, Weekly limit, Daily limit, etc.</p>
          <p>• <strong>Status values:</strong> Active, Inactive</p>
          <p>• <strong>Role values:</strong> Admin, Project Manager, Developer, Designer, Client</p>
          <p>• <strong>Department values:</strong> PMO, Design, HTML, PHP, React, WordPress, QA, Delivery</p>
          <p>• Use the template above for the correct format and sample data</p>
        </div>
      </div>
    </div>
  );
}