import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/auth';
import Layout from '@/components/layout/Layout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import UsersPage from '@/pages/UsersPage';
import DepartmentsPage from '@/pages/DepartmentsPage';
import RolesPage from '@/pages/RolesPage';
import CategoriesPage from '@/pages/CategoriesPage';
import DepartmentChecklistManagementPage from '@/pages/DepartmentChecklistManagementPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Role } from '@/types';

// Role-based route protection component
function RoleProtectedRoute({ children, allowedRoles, allowedDepartments }: { 
  children: React.ReactNode; 
  allowedRoles?: Role[]; 
  allowedDepartments?: string[];
}) {
  const { user } = useAuthStore();
  
  if (!user) return <Navigate to="/login" />;
  
  // Check role permissions - support both enum and string roles
  if (allowedRoles) {
    const userRole = user.role as string;
    const hasAccess = allowedRoles.some(role => role === userRole) ||
                     allowedRoles.map(r => r.toString()).includes(userRole) ||
                     userRole === 'ADMIN' || userRole === 'SU_ADMIN';
    
    if (!hasAccess) {
      return <Navigate to="/projects" />;
    }
  }
  
  // Check department permissions
  if (allowedDepartments && user.departmentMaster?.code && 
      !allowedDepartments.includes(user.departmentMaster.code)) {
    return <Navigate to="/projects" />;
  }
  
  return <>{children}</>;
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/projects" />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/projects" />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/projects" />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route 
            path="users" 
            element={
              <RoleProtectedRoute allowedRoles={[Role.PROJECT_MANAGER]}>
                <UsersPage />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="categories" 
            element={
              <RoleProtectedRoute allowedRoles={[Role.PROJECT_MANAGER]}>
                <CategoriesPage />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="departments" 
            element={
              <RoleProtectedRoute allowedRoles={[Role.PROJECT_MANAGER]}>
                <DepartmentsPage />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="roles" 
            element={
              <RoleProtectedRoute allowedRoles={[Role.PROJECT_MANAGER]}>
                <RolesPage />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="department-checklists" 
            element={
              <RoleProtectedRoute allowedRoles={[Role.PROJECT_MANAGER]}>
                <DepartmentChecklistManagementPage />
              </RoleProtectedRoute>
            } 
          />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/projects" />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;