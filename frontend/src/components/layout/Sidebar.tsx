import { NavLink } from 'react-router-dom';
import { 
  FolderOpen, 
  Users, 
  Building2,
  UserCheck,
  FileText,
  LogOut,
  BarChart3,
  Settings
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Role } from '@/types';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

interface NavigationCategory {
  name: string;
  icon: any;
  items: NavigationItem[];
}

const allNavigationCategories: NavigationCategory[] = [
  {
    name: 'Project Management',
    icon: BarChart3,
    items: [
      { name: 'Projects', href: '/projects', icon: FolderOpen },
    ],
  },
  {
    name: 'User Management',
    icon: Users,
    items: [
      { name: 'Users', href: '/users', icon: Users },
      { name: 'Roles', href: '/roles', icon: UserCheck },
    ],
  },
  {
    name: 'Organization Setup',
    icon: Settings,
    items: [
      { name: 'Departments', href: '/departments', icon: Building2 },
      { name: 'Department Checklists', href: '/department-checklists', icon: FileText },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  // Filter navigation based on role and department
  const getFilteredNavigationCategories = (): NavigationCategory[] => {
    if (!user) return [];
    
    // Admin and Super Admin see all categories
    if (user.role === 'ADMIN' || user.role === 'SU_ADMIN') {
      return allNavigationCategories;
    }
    
    // Project Managers see all categories
    if (user.role === Role.PROJECT_MANAGER) {
      return allNavigationCategories;
    }
    
    // PMO department users see only Project Management
    if (user.departmentMaster?.code === 'PMO') {
      return allNavigationCategories.filter(category => 
        category.name === 'Project Management'
      );
    }
    
    // Other departments see only Project Management by default
    return allNavigationCategories.filter(category => 
      category.name === 'Project Management'
    );
  };

  const navigationCategories = getFilteredNavigationCategories();

  return (
    <div className="flex flex-col w-64 bg-card border-r">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">PM</span>
          </div>
          <span className="ml-2 text-lg font-semibold">Project Manager</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        {navigationCategories.map((category, categoryIndex) => (
          <div key={category.name}>
            {/* Category Header */}
            <div className="flex items-center px-2 py-2 mb-3">
              <category.icon className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category.name}
              </span>
            </div>
            
            {/* Category Items */}
            <div className="space-y-1">
              {category.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ml-2',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-medium text-sm">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.roleMaster?.name || user?.role}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={logout}
          className="w-full justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}