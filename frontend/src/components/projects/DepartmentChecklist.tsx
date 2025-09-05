import { useState, useEffect } from 'react';
import { CheckCircle, Circle, AlertTriangle, FileText, Clock, User, Edit, Link, ExternalLink, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DepartmentChecklistProgress, 
  Department,
  UpdateChecklistItemDto
} from '@/types';
import { projectsApi, checklistTemplatesApi } from '@/lib/api';
import { toast } from 'sonner';
import ChecklistItemUpdateDialog from './ChecklistItemUpdateDialog';

interface DepartmentChecklistProps {
  projectId: string;
  department: Department | string;
  onProgressUpdate?: (progress: DepartmentChecklistProgress) => void;
}

// Default checklist templates for each department
const defaultChecklists: Record<Department, Array<{title: string; description?: string; isRequired: boolean}>> = {
  [Department.PMO]: [
    { title: "Client requirements documented and approved", description: "All client requirements have been documented in detail and formally approved", isRequired: true },
    { title: "Project scope clearly defined", description: "Project scope, deliverables, and boundaries are well-defined", isRequired: true },
    { title: "Timeline and milestones established", description: "Project timeline with clear milestones has been created and approved", isRequired: true },
    { title: "Resource allocation confirmed", description: "Team members and resources have been allocated and confirmed", isRequired: true },
    { title: "Technical specifications reviewed", description: "Technical requirements and specifications have been reviewed and approved", isRequired: true },
    { title: "Risk assessment completed", description: "Project risks have been identified and mitigation strategies defined", isRequired: false },
    { title: "Client approval obtained for project sections", description: "Client has approved the project structure and content sections", isRequired: true },
  ],
  [Department.DESIGN]: [
    { title: "Design brief received from PMO", description: "Complete design brief with requirements received from PMO team", isRequired: true },
    { title: "Wireframes completed", description: "All wireframes for the project have been created and reviewed", isRequired: true },
    { title: "Design mockups created", description: "High-fidelity design mockups completed for all pages/screens", isRequired: true },
    { title: "Client design approval obtained", description: "Client has approved all design mockups and variations", isRequired: true },
    { title: "Design assets organized", description: "All design files organized and ready for handoff", isRequired: true },
    { title: "Design system documentation", description: "Color schemes, typography, and component guidelines documented", isRequired: false },
  ],
  [Department.HTML]: [
    { title: "Design files received from DESIGN", description: "All approved design files and assets received from design team", isRequired: true },
    { title: "HTML structure completed", description: "Complete HTML structure implemented according to designs", isRequired: true },
    { title: "CSS styling implemented", description: "All CSS styling completed to match approved designs", isRequired: true },
    { title: "Responsive design tested", description: "Design tested and working on mobile, tablet, and desktop", isRequired: true },
    { title: "Cross-browser compatibility verified", description: "Tested on Chrome, Firefox, Safari, and Edge browsers", isRequired: true },
    { title: "HTML QA testing passed", description: "Internal HTML QA testing completed successfully", isRequired: true },
    { title: "Code optimization completed", description: "HTML/CSS code optimized for performance and maintainability", isRequired: false },
  ],
  [Department.PHP]: [
    { title: "HTML files received", description: "All HTML templates received from HTML team", isRequired: true },
    { title: "Database design completed", description: "Database schema designed and implemented", isRequired: true },
    { title: "API endpoints developed", description: "All required API endpoints developed and tested", isRequired: true },
    { title: "Backend functionality implemented", description: "Core backend logic and business rules implemented", isRequired: true },
    { title: "Integration testing completed", description: "Frontend-backend integration tested and working", isRequired: true },
    { title: "Security measures implemented", description: "Authentication, authorization, and security measures in place", isRequired: true },
    { title: "Code review completed", description: "Code reviewed by senior developer or team lead", isRequired: true },
  ],
  [Department.REACT]: [
    { title: "HTML templates received", description: "All HTML templates received from HTML team", isRequired: true },
    { title: "Component architecture planned", description: "React component structure and architecture planned", isRequired: true },
    { title: "React components developed", description: "All React components developed according to specifications", isRequired: true },
    { title: "State management implemented", description: "State management (Redux/Context) properly implemented", isRequired: true },
    { title: "API integration completed", description: "All API calls and data fetching implemented", isRequired: true },
    { title: "Error handling implemented", description: "Proper error handling and user feedback implemented", isRequired: true },
    { title: "Code review completed", description: "Code reviewed by senior developer or team lead", isRequired: true },
  ],
  [Department.WORDPRESS]: [
    { title: "Design files received", description: "All approved design files received from design team", isRequired: true },
    { title: "WordPress theme setup", description: "Custom WordPress theme structure created", isRequired: true },
    { title: "Custom post types created", description: "Required custom post types and fields implemented", isRequired: true },
    { title: "Theme functionality completed", description: "All theme functionality and features implemented", isRequired: true },
    { title: "Plugin integration completed", description: "Required plugins integrated and configured", isRequired: true },
    { title: "Content migration completed", description: "Existing content migrated to new WordPress site", isRequired: false },
    { title: "WordPress security implemented", description: "Security measures and best practices implemented", isRequired: true },
  ],
  [Department.QA]: [
    { title: "Test plan created", description: "Comprehensive test plan covering all functionality", isRequired: true },
    { title: "Functional testing completed", description: "All features tested according to requirements", isRequired: true },
    { title: "Cross-browser testing completed", description: "Testing completed on all required browsers", isRequired: true },
    { title: "Mobile responsiveness tested", description: "Responsive design tested on various devices", isRequired: true },
    { title: "Performance testing completed", description: "Load times and performance metrics verified", isRequired: true },
    { title: "Security testing completed", description: "Basic security vulnerabilities checked", isRequired: true },
    { title: "Bug report documentation", description: "All bugs documented with steps to reproduce", isRequired: true },
    { title: "Final QA approval", description: "QA team lead approval for release", isRequired: true },
  ],
  [Department.DELIVERY]: [
    { title: "Production environment ready", description: "Production server and environment prepared", isRequired: true },
    { title: "Domain and hosting configured", description: "Domain name and hosting properly configured", isRequired: true },
    { title: "SSL certificates installed", description: "Security certificates installed and verified", isRequired: true },
    { title: "Final deployment completed", description: "Application successfully deployed to production", isRequired: true },
    { title: "Post-deployment testing", description: "Basic functionality verified on live environment", isRequired: true },
    { title: "Client handover completed", description: "Project handed over to client with documentation", isRequired: true },
    { title: "Documentation provided", description: "User manuals and technical documentation provided", isRequired: false },
  ],
  [Department.MANAGER]: []
};

export default function DepartmentChecklist({ 
  projectId, 
  department, 
  onProgressUpdate 
}: DepartmentChecklistProps) {
  const [checklistProgress, setChecklistProgress] = useState<DepartmentChecklistProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadChecklistProgress();
  }, [projectId, department]);

  const loadChecklistProgress = async () => {
    try {
      setLoading(true);
      
      // Try to load from API first
      try {
        const progress = await projectsApi.getChecklistProgress(projectId, department);
        setChecklistProgress(progress);
        console.log('Loaded checklist progress from API:', progress);
        return;
      } catch (apiError: any) {
        console.error('Failed to load checklist progress from API:', {
          error: apiError.message,
          status: apiError.response?.status,
          data: apiError.response?.data,
        });
        
        // Only create from templates if API is not implemented
        if (apiError.response?.status === 404 || apiError.message.includes('not implemented')) {
          console.warn('Project checklist progress API not yet implemented, creating from templates');
        } else {
          // For other errors (auth, network, etc.), show error but still create from templates
          console.warn('API error occurred, falling back to templates:', apiError.message);
        }
      }
      
      // Load templates from API or fall back to defaults
      let templateItems = [];
      try {
        const departmentCode = typeof department === 'string' ? department : department;
        const templates = await checklistTemplatesApi.getByDepartment(departmentCode);
        templateItems = templates.map((template: any) => ({
          title: template.title,
          description: template.description,
          isRequired: template.isRequired
        }));
      } catch (templateError) {
        console.warn('Template API not yet implemented, using hardcoded defaults');
        const deptKey = typeof department === 'string' ? department as Department : department;
        templateItems = defaultChecklists[deptKey] || [];
      }
      
      // Create mock progress from templates
      const mockProgress: DepartmentChecklistProgress = {
        department: department as Department,
        totalItems: templateItems.length,
        completedItems: 0,
        requiredItems: templateItems.filter((item: any) => item.isRequired).length,
        completedRequiredItems: 0,
        completionPercentage: 0,
        requiredCompletionPercentage: 0,
        canProceedToNext: false,
        items: templateItems.map((item: any, index: number) => ({
          id: `${department}-${index}`,
          projectId,
          templateId: `template-${department}-${index}`,
          department,
          title: item.title,
          description: item.description,
          isCompleted: false,
          isRequired: item.isRequired,
          order: index,
          template: {
            id: `template-${department}-${index}`,
            department,
            title: item.title,
            description: item.description,
            isRequired: item.isRequired,
            order: index,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }))
      };
      setChecklistProgress(mockProgress);
    } catch (error) {
      console.error('Failed to load checklist progress:', error);
      toast.error('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };


  const handleDetailedUpdate = async (itemId: string, data: UpdateChecklistItemDto) => {
    if (!checklistProgress) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      // Try to update via API first, fall back to local state
      try {
        const updatedItem = await projectsApi.updateChecklistItem(projectId, itemId, data);
        console.log('Checklist item updated successfully via API:', updatedItem);
      } catch (apiError: any) {
        console.error('Failed to update checklist item via API:', {
          error: apiError.message,
          status: apiError.response?.status,
          data: apiError.response?.data,
        });
        
        // Only fall back to local state for specific errors (not network/auth errors)
        if (apiError.response?.status === 404 || apiError.message.includes('not implemented')) {
          console.warn('API endpoint not found, updating local state only');
        } else {
          // For other errors (auth, network, etc.), show error and don't proceed
          toast.error(`Failed to save checklist update: ${apiError.response?.data?.message || apiError.message}`);
          return;
        }
      }
      
      // Update local state
      const updatedItems = checklistProgress.items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              isCompleted: data.isCompleted,
              completedAt: data.isCompleted ? (data.completedDate ? new Date(data.completedDate).toISOString() : new Date().toISOString()) : undefined,
              completedDate: data.completedDate,
              notes: data.notes || item.notes,
              links: data.links ? data.links.map((link, index) => ({
                id: `link-${itemId}-${index}`,
                url: link.url,
                title: link.title,
                type: link.type,
                addedAt: new Date().toISOString()
              })) : item.links,
              lastUpdatedAt: new Date().toISOString()
            }
          : item
      );

      const completedItems = updatedItems.filter(item => item.isCompleted).length;
      const completedRequiredItems = updatedItems.filter(item => item.isCompleted && item.isRequired).length;
      const requiredItems = updatedItems.filter(item => item.isRequired).length;

      const newProgress: DepartmentChecklistProgress = {
        ...checklistProgress,
        items: updatedItems,
        completedItems,
        completedRequiredItems,
        completionPercentage: (completedItems / updatedItems.length) * 100,
        requiredCompletionPercentage: (completedRequiredItems / requiredItems) * 100,
        canProceedToNext: completedRequiredItems === requiredItems,
      };

      setChecklistProgress(newProgress);
      onProgressUpdate?.(newProgress);
      
      toast.success(`Checklist item updated successfully`);
    } catch (error) {
      console.error('Failed to update checklist item:', error);
      toast.error('Failed to update checklist item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleNotesToggle = (itemId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setNoteInputs(prev => ({ ...prev, [itemId]: notes }));
  };

  const handleHistoryToggle = (itemId: string) => {
    setExpandedHistory(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!checklistProgress || checklistProgress.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {department} Department Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No checklist items available for this department.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {department} Department Checklist
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={checklistProgress.canProceedToNext ? "default" : "secondary"}
              className={checklistProgress.canProceedToNext ? "bg-green-100 text-green-800 border-green-200" : ""}
            >
              {checklistProgress.completedRequiredItems}/{checklistProgress.requiredItems} Required
            </Badge>
            <div className="text-sm text-muted-foreground">
              {Math.round(checklistProgress.completionPercentage)}% Complete
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{checklistProgress.completedItems}/{checklistProgress.totalItems}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${checklistProgress.completionPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Required Items</span>
            <span>{checklistProgress.completedRequiredItems}/{checklistProgress.requiredItems}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                checklistProgress.canProceedToNext ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${checklistProgress.requiredCompletionPercentage}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {checklistProgress.items.map((item) => {
            const isExpanded = expandedNotes.has(item.id);
            const isHistoryExpanded = expandedHistory.has(item.id);
            const isUpdating = updatingItems.has(item.id);
            
            return (
              <div 
                key={item.id}
                className={`border rounded-lg p-4 transition-all ${
                  item.isCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : item.isRequired 
                    ? 'bg-white border-gray-200' 
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItem(item.id)}
                    disabled={isUpdating}
                    className="p-0 h-auto hover:bg-transparent"
                  >
                    {item.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${item.isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                          {item.title}
                          {item.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {!item.isRequired && (
                          <Badge variant="outline" className="text-xs">
                            Optional
                          </Badge>
                        )}
                        {item.links && item.links.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <Link className="h-3 w-3 mr-1" />
                            {item.links.length}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotesToggle(item.id)}
                          className="text-xs px-2 py-1 h-auto"
                        >
                          Notes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedItem(item.id)}
                          className="text-xs px-2 py-1 h-auto flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Update
                        </Button>
                      </div>
                    </div>

                    {/* Enhanced Completion Info */}
                    {(item.isCompleted || item.lastUpdatedAt) && (
                      <div className="space-y-2">
                        {/* Completion Info */}
                        {item.isCompleted && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {(item.completedDate || item.completedAt) && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Completed {formatDate(item.completedDate || item.completedAt!)}
                              </div>
                            )}
                            {item.completedBy && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {item.completedBy.name}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Last Updated Info */}
                        {item.lastUpdatedAt && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <History className="h-3 w-3" />
                            Last updated {formatDate(item.lastUpdatedAt)}
                            {item.lastUpdatedBy && ` by ${item.lastUpdatedBy.name}`}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Links Display */}
                    {item.links && item.links.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-700">Attachments:</div>
                        <div className="flex flex-wrap gap-2">
                          {item.links.map((link, linkIndex) => (
                            <a
                              key={linkIndex}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {link.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Update History */}
                    {item.updateHistory && item.updateHistory.length > 0 && (
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHistoryToggle(item.id)}
                          className="text-xs px-0 py-1 h-auto text-blue-600 hover:text-blue-800"
                        >
                          <History className="h-3 w-3 mr-1" />
                          View History ({item.updateHistory.length})
                        </Button>
                        
                        {isHistoryExpanded && (
                          <div className="pl-4 space-y-2 border-l-2 border-blue-200">
                            {item.updateHistory.map((update, updateIndex) => (
                              <div key={updateIndex} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                  <span>{update.updatedBy.name}</span>
                                  <span>{formatDate(update.date)}</span>
                                </div>
                                <p className="text-sm text-gray-800">{update.notes}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Notes Section (Legacy) */}
                    {isExpanded && (
                      <div className="space-y-2 pt-2 border-t">
                        <label className="text-sm font-medium text-gray-700">
                          Quick Notes {!item.isRequired && <span className="text-gray-500">(optional)</span>}
                        </label>
                        <textarea
                          placeholder="Add quick notes about this checklist item..."
                          value={noteInputs[item.id] || item.notes || ''}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          className="w-full min-h-[60px] text-sm p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="text-xs text-gray-500">Use the Update button above for detailed updates with dates and links</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary and Action */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Department Readiness</div>
              <div className="text-sm text-muted-foreground">
                {checklistProgress.canProceedToNext 
                  ? "All required items completed. Ready to proceed to next department."
                  : `${checklistProgress.requiredItems - checklistProgress.completedRequiredItems} required items remaining.`
                }
              </div>
            </div>
            
            {checklistProgress.canProceedToNext ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Ready to Proceed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Incomplete</span>
              </div>
            )}
          </div>
        </div>

        {/* Update Dialog */}
        {selectedItem && (
          <ChecklistItemUpdateDialog
            isOpen={selectedItem !== null}
            onClose={() => setSelectedItem(null)}
            item={checklistProgress.items.find(item => item.id === selectedItem)!}
            onUpdate={handleDetailedUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
}