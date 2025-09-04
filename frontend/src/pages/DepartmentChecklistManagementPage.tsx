import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { checklistTemplatesApi, departmentsApi } from '@/lib/api';
import { toast } from 'sonner';

interface DepartmentMaster {
  id: string;
  name: string;
  code: string;
  order: number;
  isActive: boolean;
}

interface ChecklistTemplate {
  id: string;
  department: string;
  title: string;
  description?: string;
  isRequired: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChecklistItem {
  title: string;
  description?: string;
  isRequired: boolean;
}

export default function DepartmentChecklistManagementPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [departments, setDepartments] = useState<DepartmentMaster[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [editingItem, setEditingItem] = useState<ChecklistTemplate | null>(null);
  const [newItem, setNewItem] = useState<ChecklistItem>({ title: '', description: '', isRequired: true });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      loadTemplates();
    }
  }, [selectedDepartment]);

  const loadDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const mainDepartments = await departmentsApi.getMainDepartments();
      setDepartments(mainDepartments);
      if (mainDepartments.length > 0 && !selectedDepartment) {
        setSelectedDepartment(mainDepartments[0].code);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const templates = await checklistTemplatesApi.getByDepartment(selectedDepartment);
      setTemplates(templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load checklist templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const template = await checklistTemplatesApi.create({
        department: selectedDepartment,
        title: newItem.title,
        description: newItem.description,
        isRequired: newItem.isRequired,
        order: templates.length
      });

      setTemplates([...templates, template]);
      setNewItem({ title: '', description: '', isRequired: true });
      setShowAddForm(false);
      toast.success('Checklist item added');
    } catch (error) {
      console.error('Failed to add item:', error);
      toast.error('Failed to add checklist item');
    }
  };

  const handleUpdateItem = async (template: ChecklistTemplate) => {
    try {
      const updatedTemplate = await checklistTemplatesApi.update(template.id, {
        title: template.title,
        description: template.description,
        isRequired: template.isRequired,
        order: template.order
      });
      
      setTemplates(templates.map(t => t.id === template.id ? updatedTemplate : t));
      setEditingItem(null);
      toast.success('Checklist item updated');
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error('Failed to update checklist item');
    }
  };

  const handleDeleteItem = async (templateId: string) => {
    try {
      await checklistTemplatesApi.delete(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success('Checklist item deleted');
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete checklist item');
    }
  };

  const handleReorderItems = async (fromIndex: number, toIndex: number) => {
    const reorderedTemplates = [...templates];
    const [removed] = reorderedTemplates.splice(fromIndex, 1);
    reorderedTemplates.splice(toIndex, 0, removed);

    // Update order values
    const updatedTemplates = reorderedTemplates.map((template, index) => ({
      ...template,
      order: index
    }));

    setTemplates(updatedTemplates);
    
    try {
      const itemIds = updatedTemplates.map(t => t.id);
      await checklistTemplatesApi.reorder(selectedDepartment, itemIds);
      toast.success('Checklist items reordered');
    } catch (error) {
      console.error('Failed to reorder items:', error);
      toast.error('Failed to reorder items');
      loadTemplates();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Department Checklist Management</h1>
          <p className="text-muted-foreground">Configure checklist templates for each department's workflow</p>
        </div>
      </div>

      {/* Department Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Department</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDepartments ? (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {departments.map((dept) => (
                <Button
                  key={dept.code}
                  variant={selectedDepartment === dept.code ? "default" : "outline"}
                  onClick={() => setSelectedDepartment(dept.code)}
                  className="justify-start"
                >
                  {dept.name}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist Items Management */}
      {selectedDepartment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {departments.find(d => d.code === selectedDepartment)?.name || selectedDepartment} Department Checklist
              </CardTitle>
              <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add New Item Form */}
              {showAddForm && (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Title *</label>
                        <Input
                          placeholder="Enter checklist item title"
                          value={newItem.title}
                          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                          placeholder="Enter optional description"
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          className="w-full min-h-[80px] text-sm p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="required"
                          checked={newItem.isRequired}
                          onChange={(e) => setNewItem({ ...newItem, isRequired: e.target.checked })}
                        />
                        <label htmlFor="required" className="text-sm font-medium">Required item</label>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddItem}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowAddForm(false);
                            setNewItem({ title: '', description: '', isRequired: true });
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Templates */}
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No checklist items</h3>
                  <p className="text-sm text-muted-foreground">Add your first checklist item for {departments.find(d => d.code === selectedDepartment)?.name || selectedDepartment} department</p>
                </div>
              ) : (
                templates.map((template, index) => (
                  <Card key={template.id}>
                    <CardContent className="pt-6">
                      {editingItem?.id === template.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <Input
                              value={editingItem.title}
                              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                              value={editingItem.description || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                              className="w-full min-h-[80px] text-sm p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`required-${template.id}`}
                              checked={editingItem.isRequired}
                              onChange={(e) => setEditingItem({ ...editingItem, isRequired: e.target.checked })}
                            />
                            <label htmlFor={`required-${template.id}`} className="text-sm font-medium">Required item</label>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdateItem(editingItem)}>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button variant="outline" onClick={() => setEditingItem(null)}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{template.title}</h4>
                              {template.isRequired ? (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Optional</Badge>
                              )}
                            </div>
                            {template.description && (
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            )}
                            <div className="text-xs text-muted-foreground mt-2">
                              Order: {template.order + 1}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingItem(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(template.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="flex flex-col">
                              {index > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReorderItems(index, index - 1)}
                                  className="text-xs px-1 py-0 h-5"
                                  title="Move up"
                                >
                                  ↑
                                </Button>
                              )}
                              {index < templates.length - 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReorderItems(index, index + 1)}
                                  className="text-xs px-1 py-0 h-5"
                                  title="Move down"
                                >
                                  ↓
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
        </Card>
      )}
    </div>
  );
}