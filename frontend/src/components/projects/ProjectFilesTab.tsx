import { useState, useEffect } from 'react';
import { 
  FileText, 
  Link, 
  Download, 
  ExternalLink, 
  FolderOpen,
  Paperclip,
  Calendar,
  User,
  CheckCircle2,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Project, DepartmentChecklistProgress } from '@/types';
import { projectsApi, departmentsApi } from '@/lib/api';

interface ProjectFilesTabProps {
  project: Project;
}

interface FileWithContext {
  id: string;
  title: string;
  url: string;
  type: 'document' | 'link' | 'reference';
  addedAt: string;
  addedBy?: {
    id: string;
    name: string;
  };
  itemTitle: string;
  itemCompleted: boolean;
  itemRequired: boolean;
  department: string;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ProjectFilesTab({ project }: ProjectFilesTabProps) {
  const [allFiles, setAllFiles] = useState<FileWithContext[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileWithContext[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        setIsLoading(true);
        
        // Get all departments that the project has been through
        const departmentSet = new Set([project.currentDepartment]);
        if (project.departmentHistory) {
          project.departmentHistory.forEach(history => {
            departmentSet.add(history.toDepartment);
            if (history.fromDepartment) {
              departmentSet.add(history.fromDepartment);
            }
          });
        }
        
        // Fetch checklist data for all departments
        const checklistPromises = Array.from(departmentSet).map(async dept => {
          try {
            const progress = await projectsApi.getChecklistProgress(project.id, dept);
            return { department: dept, progress };
          } catch (error) {
            console.warn(`Could not fetch checklist for ${dept}:`, error);
            return null;
          }
        });
        
        const checklistResults = await Promise.all(checklistPromises);
        
        // Extract all files from all departments
        const files: FileWithContext[] = [];
        checklistResults.forEach(result => {
          if (result?.progress?.items) {
            result.progress.items.forEach(item => {
              if (item.links && item.links.length > 0) {
                item.links.forEach(link => {
                  files.push({
                    ...link,
                    itemTitle: item.title,
                    itemCompleted: item.isCompleted,
                    itemRequired: item.isRequired,
                    department: result.department
                  });
                });
              }
            });
          }
        });
        
        setAllFiles(files);
        setFilteredFiles(files);
      } catch (error) {
        console.error('Error fetching project files:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllFiles();
  }, [project.id]);

  useEffect(() => {
    let filtered = allFiles;
    
    // Filter by tab
    if (activeTab === 'documents') {
      filtered = filtered.filter(file => file.type === 'document');
    } else if (activeTab === 'links') {
      filtered = filtered.filter(file => file.type === 'link' || file.type === 'reference');
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredFiles(filtered);
  }, [allFiles, activeTab, searchTerm]);

  const documents = allFiles.filter(file => file.type === 'document');
  const links = allFiles.filter(file => file.type === 'link' || file.type === 'reference');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-500 rounded-full mb-6"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Files & Documents</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Gathering all files and documents from project checklist items...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Files Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{allFiles.length}</p>
              <p className="text-xs text-gray-600">Total Files</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              <p className="text-xs text-gray-600">Documents</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Link className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{links.length}</p>
              <p className="text-xs text-gray-600">Links</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {allFiles.filter(f => f.itemCompleted).length}
              </p>
              <p className="text-xs text-gray-600">From Completed Items</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search files, documents, links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger 
                value="all" 
                isActive={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
                className="flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                All Files ({allFiles.length})
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                isActive={activeTab === 'documents'}
                onClick={() => setActiveTab('documents')}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Documents ({documents.length})
              </TabsTrigger>
              <TabsTrigger 
                value="links" 
                isActive={activeTab === 'links'}
                onClick={() => setActiveTab('links')}
                className="flex items-center gap-2"
              >
                <Link className="w-4 h-4" />
                Links ({links.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" isActive={activeTab === 'all'}>
              <div className="space-y-3">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${
                          file.type === 'document' 
                            ? 'bg-blue-100' 
                            : 'bg-green-100'
                        }`}>
                          {file.type === 'document' ? (
                            <FileText className={`w-5 h-5 ${
                              file.type === 'document' ? 'text-blue-600' : 'text-green-600'
                            }`} />
                          ) : (
                            <Link className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">{file.title}</h4>
                            <Badge className={`text-xs ${
                              file.type === 'document' 
                                ? 'bg-blue-100 text-blue-800' 
                                : file.type === 'reference'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {file.type}
                            </Badge>
                            {file.itemRequired && (
                              <Badge className="text-xs bg-purple-100 text-purple-800">Required</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>From: {file.itemTitle}</span>
                            <span>Department: {file.department.replace('_', ' ')}</span>
                            {file.itemCompleted && (
                              <Badge className="text-xs bg-green-100 text-green-800">Item Completed</Badge>
                            )}
                          </div>
                          {file.addedBy && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <User className="w-3 h-3" />
                              <span>Added by {file.addedBy.name}</span>
                              {file.addedAt && (
                                <>
                                  <Calendar className="w-3 h-3 ml-2" />
                                  <span>{formatDate(new Date(file.addedAt))}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="outline" className="h-8 px-3">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {file.type === 'document' ? 'View' : 'Open'}
                        </Button>
                        {file.type === 'document' && (
                          <Button size="sm" variant="outline" className="h-8 px-3">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {searchTerm ? 'No files match your search' : 'No files found'}
                    </p>
                    <p className="text-sm">
                      {searchTerm 
                        ? 'Try adjusting your search terms' 
                        : 'Files and documents will appear here when added to checklist items'
                      }
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents" isActive={activeTab === 'documents'}>
              <div className="space-y-3">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">{file.title}</h4>
                            {file.itemRequired && (
                              <Badge className="text-xs bg-purple-100 text-purple-800">Required</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>From: {file.itemTitle}</span>
                            <span>Department: {file.department.replace('_', ' ')}</span>
                            {file.itemCompleted && (
                              <Badge className="text-xs bg-green-100 text-green-800">Item Completed</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="outline" className="h-8 px-3">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 px-3">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium mb-2">No documents found</p>
                    <p className="text-sm">Documents will appear here when added to checklist items</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="links" isActive={activeTab === 'links'}>
              <div className="space-y-3">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Link className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">{file.title}</h4>
                            <Badge className={`text-xs ${
                              file.type === 'reference' 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {file.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600 mb-1">
                            <span>From: {file.itemTitle}</span>
                            <span>Department: {file.department.replace('_', ' ')}</span>
                          </div>
                          {file.url && (
                            <p className="text-xs text-blue-600 truncate" title={file.url}>
                              {file.url}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="outline" className="h-8 px-3">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Link className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium mb-2">No links found</p>
                    <p className="text-sm">Links will appear here when added to checklist items</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}