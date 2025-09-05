import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck, Search, Filter, Users, Building2, X, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import AlertDialog from '@/components/ui/alert-dialog';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; role: Role | null }>({ isOpen: false, role: null });
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string; type?: 'error' | 'warning' | 'info' }>({ isOpen: false, title: '', message: '' });
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

  const handleDelete = async (role: Role) => {
    try {
      await api.delete(`/roles/${role.id}`);
      toast.success('Role deleted successfully');
      setDeleteDialog({ isOpen: false, role: null });
      fetchRoles();
    } catch (error: any) {
      setDeleteDialog({ isOpen: false, role: null });
      setAlertDialog({
        isOpen: true,
        title: 'Failed to Delete Role',
        message: error.response?.data?.message || 'An error occurred while deleting the role.',
        type: 'error'
      });
    }
  };

  const openDeleteDialog = (role: Role) => {
    setDeleteDialog({ isOpen: true, role });
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

  // Filter and search logic
  const filteredRoles = roles.filter(role => {
    const matchesSearch = 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.department.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === '' || role.departmentId === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const groupedRoles = filteredRoles.reduce((acc, role) => {
    const deptName = role.department.name;
    if (!acc[deptName]) {
      acc[deptName] = [];
    }
    acc[deptName].push(role);
    return acc;
  }, {} as Record<string, Role[]>);

  const totalRoles = roles.length;
  const activeRoles = roles.filter(role => role.isActive).length;
  const departmentCount = new Set(roles.map(role => role.departmentId)).size;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600 mt-1">Manage roles and permissions within departments</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="w-fit">
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{totalRoles}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Roles</p>
                <p className="text-2xl font-bold text-gray-900">{activeRoles}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{departmentCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search roles by name, code, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
          
          {/* Active Filters */}
          {(searchTerm || selectedDepartment) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-1 hover:bg-gray-300 rounded-full">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedDepartment && (
                <Badge variant="secondary" className="gap-1">
                  Department: {departments.find(d => d.id === selectedDepartment)?.name}
                  <button onClick={() => setSelectedDepartment('')} className="ml-1 hover:bg-gray-300 rounded-full">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Roles Content */}
      <div className="space-y-8">
        {Object.keys(groupedRoles).length === 0 ? (
          <Card className="p-12 text-center">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No roles found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedDepartment
                ? 'No roles match your current filters. Try adjusting your search criteria.'
                : 'Get started by creating your first role.'}
            </p>
            {!searchTerm && !selectedDepartment && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Role
              </Button>
            )}
          </Card>
        ) : (
          Object.entries(groupedRoles).map(([departmentName, deptRoles]) => (
            <div key={departmentName}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{departmentName} Department</h2>
                  <p className="text-sm text-gray-600">{deptRoles.length} role{deptRoles.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {deptRoles.map((role) => (
                  <Card key={role.id} className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <UserCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{role.name}</h3>
                          <p className="text-sm text-gray-500">Code: {role.code}</p>
                        </div>
                      </div>
                      <div className="relative group">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
                          <button
                            onClick={() => startEdit(role)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteDialog(role)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {role.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{role.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={role.isActive ? 'default' : 'secondary'}
                        className={role.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }
                      >
                        {role.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(role)}
                          className="h-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(role)}
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg transform transition-all duration-300 ease-out">
            <Card className="p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingRole ? 'Edit Role' : 'Create New Role'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={editingRole ? handleUpdate : handleCreate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Senior Developer"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role Code *</label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., SR_DEV"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this role's responsibilities..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <div className="relative">
                    <select
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active Role
                  </label>
                  <span className="text-xs text-gray-500">Active roles can be assigned to users</span>
                </div>
                
                <div className="flex gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1">
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, role: null })}
        onConfirm={() => deleteDialog.role && handleDelete(deleteDialog.role)}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${deleteDialog.role?.name}"? This action cannot be undone.`}
        confirmText="Delete Role"
        type="danger"
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ isOpen: false, title: '', message: '' })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
}