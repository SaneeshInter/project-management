import { useState, useEffect } from 'react';
import { Plus, Settings, ArrowRight, Clock, Users, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryMaster, Department } from '@/types';
import { categoriesApi } from '@/lib/api';
import CreateCategoryModal from '@/components/categories/CreateCategoryModal';
import EditCategoryModal from '@/components/categories/EditCategoryModal';
import WorkflowBuilderModal from '@/components/categories/WorkflowBuilderModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryMaster | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll(true); // Include inactive
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditCategory = (category: CategoryMaster) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleManageWorkflow = (category: CategoryMaster) => {
    setSelectedCategory(category);
    setIsWorkflowModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await categoriesApi.delete(categoryId);
      await fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const getDepartmentBadgeColor = (dept: Department, isRequired: boolean) => {
    if (!isRequired) return 'bg-gray-100 text-gray-700';
    
    switch (dept) {
      case 'PMO': return 'bg-blue-100 text-blue-800';
      case 'DESIGN': return 'bg-purple-100 text-purple-800';
      case 'HTML': return 'bg-orange-100 text-orange-800';
      case 'PHP': return 'bg-green-100 text-green-800';
      case 'REACT': return 'bg-cyan-100 text-cyan-800';
      case 'QA': return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERY': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-muted-foreground">Manage project categories and workflows</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground">
            Create and manage project categories with custom department workflows
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className={`hover:shadow-md transition-shadow ${!category.isActive ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {category.name}
                    {!category.isActive && (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description || 'No description'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Code: <span className="font-mono">{category.code}</span>
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Workflow Preview */}
                {category.departmentMappings && category.departmentMappings.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Department Workflow</h4>
                    <div className="flex flex-wrap gap-1 items-center">
                      {category.departmentMappings
                        .sort((a, b) => a.sequence - b.sequence)
                        .map((mapping, index) => (
                          <div key={mapping.id} className="flex items-center">
                            <Badge 
                              className={`text-xs ${getDepartmentBadgeColor(mapping.department, mapping.isRequired)}`}
                              variant="secondary"
                            >
                              {mapping.department}
                              {mapping.estimatedDays && ` (${mapping.estimatedDays}d)`}
                            </Badge>
                            {index < category.departmentMappings.length - 1 && (
                              <ArrowRight className="w-3 h-3 mx-1 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    No workflow configured
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {category.estimatedTotalDays && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {category.estimatedTotalDays} days
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {category.departmentMappings?.length || 0} departments
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditCategory(category)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleManageWorkflow(category)}
                    className="flex-1"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Workflow
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-muted-foreground mb-4 text-lg">No categories found</div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create your first category
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateCategoryModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchCategories}
      />

      {selectedCategory && (
        <>
          <EditCategoryModal 
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedCategory(null);
            }}
            category={selectedCategory}
            onSuccess={fetchCategories}
          />

          <WorkflowBuilderModal 
            isOpen={isWorkflowModalOpen}
            onClose={() => {
              setIsWorkflowModalOpen(false);
              setSelectedCategory(null);
            }}
            category={selectedCategory}
            onSuccess={fetchCategories}
          />
        </>
      )}
    </div>
  );
}