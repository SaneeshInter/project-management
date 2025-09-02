import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  isActive: boolean;
  parent?: Department;
  children?: Department[];
  createdAt: string;
  updatedAt: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    parentId: '',
    isActive: true,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        parentId: formData.parentId || null,
      };
      await api.post('/departments', payload);
      toast.success('Department created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', code: '', parentId: '', isActive: true });
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to create department');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;
    
    try {
      const payload = {
        ...formData,
        parentId: formData.parentId || null,
      };
      await api.patch(`/departments/${editingDepartment.id}`, payload);
      toast.success('Department updated successfully');
      setEditingDepartment(null);
      setFormData({ name: '', code: '', parentId: '', isActive: true });
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to update department');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to delete department');
    }
  };

  const startEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      parentId: department.parentId || '',
      isActive: department.isActive,
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', parentId: '', isActive: true });
    setEditingDepartment(null);
    setShowCreateModal(false);
  };

  const renderDepartmentTree = (depts: Department[]) => {
    const parentDepts = depts.filter(d => d.parentId === null);
    const childDepts = depts.filter(d => d.parentId !== null);

    return (
      <div className="space-y-2">
        {parentDepts.map(dept => (
          <div key={dept.id}>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground">Code: {dept.code}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(dept)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(dept.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
            
            {childDepts.filter(c => c.parentId === dept.id).length > 0 && (
              <div className="ml-8 mt-2 space-y-2">
                {childDepts.filter(c => c.parentId === dept.id).map(childDept => (
                  <Card key={childDept.id} className="p-3 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-primary/20 rounded" />
                        <div>
                          <h4 className="font-medium">{childDept.name}</h4>
                          <p className="text-xs text-muted-foreground">Code: {childDept.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(childDept)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(childDept.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="p-6">Loading departments...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Department Management</h1>
          <p className="text-muted-foreground">Manage organizational departments and hierarchy</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {renderDepartmentTree(departments)}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingDepartment ? 'Edit Department' : 'Create Department'}
            </h2>
            <form onSubmit={editingDepartment ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Department name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Department code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parent Department</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">No Parent (Root Department)</option>
                  {departments.filter(d => d.parentId === null).map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm">Active</label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {editingDepartment ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}