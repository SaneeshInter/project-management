import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck } from 'lucide-react';
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
}

interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  isActive: boolean;
  department: Department;
  createdAt: string;
  updatedAt: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    departmentId: '',
    isActive: true,
  });

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/roles', formData);
      toast.success('Role created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', code: '', description: '', departmentId: '', isActive: true });
      fetchRoles();
    } catch (error) {
      toast.error('Failed to create role');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    
    try {
      await api.patch(`/roles/${editingRole.id}`, formData);
      toast.success('Role updated successfully');
      setEditingRole(null);
      setFormData({ name: '', code: '', description: '', departmentId: '', isActive: true });
      fetchRoles();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      await api.delete(`/roles/${id}`);
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  const startEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description || '',
      departmentId: role.departmentId,
      isActive: role.isActive,
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', description: '', departmentId: '', isActive: true });
    setEditingRole(null);
    setShowCreateModal(false);
  };

  const groupedRoles = roles.reduce((acc, role) => {
    const deptName = role.department.name;
    if (!acc[deptName]) {
      acc[deptName] = [];
    }
    acc[deptName].push(role);
    return acc;
  }, {} as Record<string, Role[]>);

  if (loading) {
    return <div className="p-6">Loading roles...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Manage roles within departments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedRoles).map(([departmentName, deptRoles]) => (
          <div key={departmentName}>
            <h2 className="text-lg font-semibold mb-3 text-primary">{departmentName} Department</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deptRoles.map((role) => (
                <Card key={role.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <UserCheck className="w-5 h-5 text-primary mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{role.name}</h3>
                        <p className="text-sm text-muted-foreground">Code: {role.code}</p>
                        {role.description && (
                          <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            role.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {role.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(role)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(role.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingRole ? 'Edit Role' : 'Create Role'}
            </h2>
            <form onSubmit={editingRole ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Role name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Role code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Role description (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
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
                  {editingRole ? 'Update' : 'Create'}
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