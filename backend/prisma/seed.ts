import { PrismaClient, Role, ProjectCategory, ProjectStatus, TaskStatus, Priority, Department, DepartmentWorkStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generateProjectCode } from '../src/utils/project-code.util';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create department master data with upsert
  const pmoDept = await prisma.departmentMaster.upsert({
    where: { code: 'PMO' },
    update: {},
    create: {
      name: 'PMO',
      code: 'PMO',
    },
  });

  const designDept = await prisma.departmentMaster.upsert({
    where: { code: 'DESIGN' },
    update: {},
    create: {
      name: 'DESIGN',
      code: 'DESIGN',
    },
  });

  const htmlDept = await prisma.departmentMaster.upsert({
    where: { code: 'HTML' },
    update: {},
    create: {
      name: 'HTML',
      code: 'HTML',
    },
  });

  const devDept = await prisma.departmentMaster.upsert({
    where: { code: 'DEV' },
    update: {},
    create: {
      name: 'DEV',
      code: 'DEV',
    },
  });

  // Create DEV sub-departments with upsert
  const reactDept = await prisma.departmentMaster.upsert({
    where: { code: 'REACT' },
    update: {},
    create: {
      name: 'React',
      code: 'REACT',
      parentId: devDept.id,
    },
  });

  const phpDept = await prisma.departmentMaster.upsert({
    where: { code: 'PHP' },
    update: {},
    create: {
      name: 'PHP',
      code: 'PHP',
      parentId: devDept.id,
    },
  });

  const appDept = await prisma.departmentMaster.upsert({
    where: { code: 'APP' },
    update: {},
    create: {
      name: 'App',
      code: 'APP',
      parentId: devDept.id,
    },
  });

  const wordpressDept = await prisma.departmentMaster.upsert({
    where: { code: 'WORDPRESS' },
    update: {},
    create: {
      name: 'WordPress',
      code: 'WORDPRESS',
      parentId: devDept.id,
    },
  });

  const salesDept = await prisma.departmentMaster.upsert({
    where: { code: 'SALES_EXE' },
    update: {},
    create: {
      name: 'Sales Executive',
      code: 'SALES_EXE',
    },
  });

  const qaDept = await prisma.departmentMaster.upsert({
    where: { code: 'QA' },
    update: {},
    create: {
      name: 'QA',
      code: 'QA',
    },
  });

  const deliveryDept = await prisma.departmentMaster.upsert({
    where: { code: 'DELIVERY' },
    update: {},
    create: {
      name: 'Delivery',
      code: 'DELIVERY',
    },
  });

  const managerDept = await prisma.departmentMaster.upsert({
    where: { code: 'MANAGER' },
    update: {},
    create: {
      name: 'Manager',
      code: 'MANAGER',
    },
  });

  console.log('✅ Department master data created/updated');

  // Create role master data
  await prisma.roleMaster.upsert({
    where: { code: 'PC' },
    update: {},
    create: {
      name: 'Project Coordinator',
      code: 'PC',
      description: 'Coordinates project activities and timelines',
      departmentId: pmoDept.id,
    },
  });

  await prisma.roleMaster.upsert({
    where: { code: 'DESIGNER' },
    update: {},
    create: {
      name: 'Designer',
      code: 'DESIGNER',
      description: 'Creates visual designs and user interfaces',
      departmentId: designDept.id,
    },
  });

  await prisma.roleMaster.upsert({
    where: { code: 'DEVELOPER' },
    update: {},
    create: {
      name: 'Developer',
      code: 'DEVELOPER',
      description: 'Develops software applications and systems',
      departmentId: devDept.id,
    },
  });

  await prisma.roleMaster.upsert({
    where: { code: 'TESTER' },
    update: {},
    create: {
      name: 'Tester',
      code: 'TESTER',
      description: 'Tests software quality and functionality',
      departmentId: devDept.id,
    },
  });

  await prisma.roleMaster.upsert({
    where: { code: 'SALES_PERSON' },
    update: {},
    create: {
      name: 'Sales Person',
      code: 'SALES_PERSON',
      description: 'Handles client relationships and sales activities',
      departmentId: salesDept.id,
    },
  });

  console.log('✅ Role master data created/updated');

  // Create users with upsert
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@intersmart.com' },
    update: {},
    create: {
      email: 'admin@intersmart.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const projectManager = await prisma.user.upsert({
    where: { email: 'pm@intersmart.com' },
    update: {},
    create: {
      email: 'pm@intersmart.com',
      name: 'Project Manager',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      department: Department.PMO,
    },
  });

  const arjun = await prisma.user.upsert({
    where: { email: 'arjun@intersmart.com' },
    update: {},
    create: {
      email: 'arjun@intersmart.com',
      name: 'Arjun Developer',
      password: hashedPassword,
      role: Role.DEVELOPER,
      department: Department.REACT,
    },
  });

  const designer = await prisma.user.upsert({
    where: { email: 'designer@intersmart.com' },
    update: {},
    create: {
      email: 'designer@intersmart.com',
      name: 'UI Designer',
      password: hashedPassword,
      role: Role.DESIGNER,
      department: Department.DESIGN,
    },
  });

  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Client User',
      password: hashedPassword,
      role: Role.CLIENT,
    },
  });

  const seniorManager = await prisma.user.upsert({
    where: { email: 'senior.manager@intersmart.com' },
    update: {},
    create: {
      email: 'senior.manager@intersmart.com',
      name: 'Senior Manager',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      department: Department.MANAGER,
    },
  });

  const operationsManager = await prisma.user.upsert({
    where: { email: 'ops.manager@intersmart.com' },
    update: {},
    create: {
      email: 'ops.manager@intersmart.com',
      name: 'Operations Manager',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      department: Department.MANAGER,
    },
  });

  const regionalManager = await prisma.user.upsert({
    where: { email: 'regional.manager@intersmart.com' },
    update: {},
    create: {
      email: 'regional.manager@intersmart.com',
      name: 'Regional Manager',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      department: Department.MANAGER,
    },
  });

  const departmentHead = await prisma.user.upsert({
    where: { email: 'dept.head@intersmart.com' },
    update: {},
    create: {
      email: 'dept.head@intersmart.com',
      name: 'Department Head',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      department: Department.MANAGER,
    },
  });

  const salesPerson = await prisma.user.upsert({
    where: { email: 'sales@intersmart.com' },
    update: {},
    create: {
      email: 'sales@intersmart.com',
      name: 'Sales Representative',
      password: hashedPassword,
      role: Role.PROJECT_COORDINATOR, // Using existing role for now
      department: Department.SALES_EXE,
    },
  });

  const salesManager = await prisma.user.upsert({
    where: { email: 'sales.manager@intersmart.com' },
    update: {},
    create: {
      email: 'sales.manager@intersmart.com',
      name: 'Sales Manager',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      department: Department.SALES_EXE,
    },
  });

  console.log('✅ Users created');

  // Create projects with initial department history
  const roomApp = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: 'Room App',
        office: 'Dubai',
        category: ProjectCategory.MOBILE_APP,
        pagesCount: 15,
        currentDepartment: Department.REACT,
        nextDepartment: Department.QA,
        targetDate: new Date('2024-12-31'),
        status: ProjectStatus.ACTIVE,
        clientName: 'Room Holdings LLC',
        observations: 'Mobile app for room booking and management',
        ownerId: arjun.id,
        startDate: new Date('2024-01-15'),
      },
    });

    // Create initial department history record
    await tx.projectDepartmentHistory.create({
      data: {
        projectId: project.id,
        fromDepartment: null,
        toDepartment: Department.REACT,
        workStatus: DepartmentWorkStatus.IN_PROGRESS,
        movedById: arjun.id,
        permissionGrantedById: projectManager.id,
        notes: 'Initial project creation in REACT department',
      },
    });

    return project;
  });

  const shayanRoyal = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: 'Shayan Royal',
        office: 'Dubai',
        category: ProjectCategory.REACT_NODEJS,
        pagesCount: 25,
        currentDepartment: Department.DELIVERY,
        targetDate: new Date('2024-11-30'),
        status: ProjectStatus.ACTIVE,
        clientName: 'Shayan Royal Hotel',
        observations: 'Hotel management system with booking capabilities',
        ownerId: projectManager.id,
        startDate: new Date('2024-02-01'),
        monthsPassed: 6,
      },
    });

    // Create initial department history record
    await tx.projectDepartmentHistory.create({
      data: {
        projectId: project.id,
        fromDepartment: null,
        toDepartment: Department.DELIVERY,
        workStatus: DepartmentWorkStatus.COMPLETED,
        movedById: projectManager.id,
        permissionGrantedById: admin.id,
        notes: 'Initial project creation in DELIVERY department',
      },
    });

    return project;
  });

  const rastenaTrading = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: 'Rastena General Trading',
        office: 'Abu Dhabi',
        category: ProjectCategory.ADVANCED_PHP,
        pagesCount: 30,
        currentDepartment: Department.PHP,
        nextDepartment: Department.QA,
        targetDate: new Date('2025-01-15'),
        status: ProjectStatus.HOLD,
        clientName: 'Rastena General Trading LLC',
        observations: 'Trading company website with inventory management',
        deviationReason: 'Client requested additional features',
        ownerId: client.id,
        startDate: new Date('2024-03-01'),
        monthsPassed: 5,
      },
    });

    // Create initial department history record
    await tx.projectDepartmentHistory.create({
      data: {
        projectId: project.id,
        fromDepartment: null,
        toDepartment: Department.PHP,
        workStatus: DepartmentWorkStatus.ON_HOLD,
        movedById: client.id,
        permissionGrantedById: admin.id,
        notes: 'Initial project creation in PHP department',
      },
    });

    return project;
  });

  const ecommerceProject = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: 'NextJS E-commerce Platform',
        office: 'Dubai',
        category: ProjectCategory.NEXT_JS,
        pagesCount: 40,
        currentDepartment: Department.QA,
        nextDepartment: Department.DELIVERY,
        targetDate: new Date('2024-10-30'),
        status: ProjectStatus.ACTIVE,
        clientName: 'Digital Commerce Inc.',
        observations: 'Modern e-commerce platform with admin dashboard',
        ownerId: projectManager.id,
        startDate: new Date('2024-01-01'),
        monthsPassed: 7,
      },
    });

    // Create initial department history record
    await tx.projectDepartmentHistory.create({
      data: {
        projectId: project.id,
        fromDepartment: null,
        toDepartment: Department.QA,
        workStatus: DepartmentWorkStatus.QA_TESTING,
        movedById: projectManager.id,
        permissionGrantedById: admin.id,
        notes: 'Initial project creation in QA department',
      },
    });

    return project;
  });

  console.log('✅ Projects created');

  // Create custom fields
  await prisma.customField.createMany({
    data: [
      {
        fieldName: 'Budget',
        fieldValue: '$25,000',
        projectId: roomApp.id,
      },
      {
        fieldName: 'Technology Stack',
        fieldValue: 'React Native, Node.js, MongoDB',
        projectId: roomApp.id,
      },
      {
        fieldName: 'Budget',
        fieldValue: '$45,000',
        projectId: shayanRoyal.id,
      },
      {
        fieldName: 'Integration Required',
        fieldValue: 'Payment Gateway, SMS API',
        projectId: shayanRoyal.id,
      },
    ],
  });

  console.log('✅ Custom fields created');

  // Create tasks
  const tasks = await prisma.task.createMany({
    data: [
      {
        title: 'User Authentication System',
        description: 'Implement JWT-based authentication with role management',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        assigneeId: arjun.id,
        projectId: roomApp.id,
        dueDate: new Date('2024-08-15'),
      },
      {
        title: 'Room Booking Interface',
        description: 'Create mobile interface for room booking functionality',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        assigneeId: designer.id,
        projectId: roomApp.id,
        dueDate: new Date('2024-09-30'),
      },
      {
        title: 'Payment Integration',
        description: 'Integrate payment gateway for room bookings',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        projectId: roomApp.id,
        dueDate: new Date('2024-10-15'),
      },
      {
        title: 'Database Schema Design',
        description: 'Design and implement database schema for hotel management',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        assigneeId: projectManager.id,
        projectId: shayanRoyal.id,
        dueDate: new Date('2024-07-01'),
      },
      {
        title: 'Admin Dashboard',
        description: 'Create admin dashboard for hotel management',
        status: TaskStatus.IN_REVIEW,
        priority: Priority.HIGH,
        assigneeId: arjun.id,
        projectId: shayanRoyal.id,
        dueDate: new Date('2024-09-15'),
      },
      {
        title: 'Inventory Management Module',
        description: 'Develop inventory tracking and management system',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        projectId: rastenaTrading.id,
        dueDate: new Date('2024-12-01'),
      },
      {
        title: 'Product Catalog System',
        description: 'Build comprehensive product catalog with search and filters',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        assigneeId: projectManager.id,
        projectId: ecommerceProject.id,
        dueDate: new Date('2024-09-30'),
      },
      {
        title: 'Shopping Cart & Checkout',
        description: 'Implement shopping cart functionality and checkout process',
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        assigneeId: arjun.id,
        projectId: ecommerceProject.id,
        dueDate: new Date('2024-10-15'),
      },
    ],
  });

  console.log('✅ Tasks created');

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        content: 'Authentication system has been successfully implemented with JWT tokens. All test cases are passing.',
        authorId: arjun.id,
        projectId: roomApp.id,
      },
      {
        content: 'The mobile UI design looks great! Can we make the booking button more prominent?',
        authorId: projectManager.id,
        projectId: roomApp.id,
      },
      {
        content: 'Payment gateway integration is pending client approval for the preferred payment methods.',
        authorId: admin.id,
        projectId: roomApp.id,
      },
      {
        content: 'Database schema has been optimized for better performance. Added proper indexing.',
        authorId: projectManager.id,
        projectId: shayanRoyal.id,
      },
      {
        content: 'Admin dashboard is complete and ready for review. Please check the user management features.',
        authorId: arjun.id,
        projectId: shayanRoyal.id,
      },
      {
        content: 'Project is on hold as per client request. Waiting for updated requirements.',
        authorId: admin.id,
        projectId: rastenaTrading.id,
      },
    ],
  });

  console.log('✅ Comments created');

  // Create checklist templates
  const checklistTemplates = await prisma.checklistTemplate.createMany({
    data: [
      // PMO Templates
      { department: 'PMO', title: 'Client requirements documented and approved', description: 'All client requirements have been documented in detail and formally approved', isRequired: true, order: 0 },
      { department: 'PMO', title: 'Project scope clearly defined', description: 'Project scope, deliverables, and boundaries are well-defined', isRequired: true, order: 1 },
      { department: 'PMO', title: 'Timeline and milestones established', description: 'Project timeline with clear milestones has been created and approved', isRequired: true, order: 2 },
      { department: 'PMO', title: 'Resource allocation confirmed', description: 'Team members and resources have been allocated and confirmed', isRequired: true, order: 3 },
      { department: 'PMO', title: 'Technical specifications reviewed', description: 'Technical requirements and specifications have been reviewed and approved', isRequired: true, order: 4 },
      { department: 'PMO', title: 'Risk assessment completed', description: 'Project risks have been identified and mitigation strategies defined', isRequired: false, order: 5 },
      { department: 'PMO', title: 'Client approval obtained for project sections', description: 'Client has approved the project structure and content sections', isRequired: true, order: 6 },
      
      // DESIGN Templates
      { department: 'DESIGN', title: 'Design brief received from PMO', description: 'Complete design brief with requirements received from PMO team', isRequired: true, order: 0 },
      { department: 'DESIGN', title: 'Wireframes completed', description: 'All wireframes for the project have been created and reviewed', isRequired: true, order: 1 },
      { department: 'DESIGN', title: 'Design mockups created', description: 'High-fidelity design mockups completed for all pages/screens', isRequired: true, order: 2 },
      { department: 'DESIGN', title: 'Client design approval obtained', description: 'Client has approved all design mockups and variations', isRequired: true, order: 3 },
      { department: 'DESIGN', title: 'Design assets organized', description: 'All design files organized and ready for handoff', isRequired: true, order: 4 },
      { department: 'DESIGN', title: 'Design system documentation', description: 'Color schemes, typography, and component guidelines documented', isRequired: false, order: 5 },
      
      // HTML Templates
      { department: 'HTML', title: 'Design files received from DESIGN', description: 'All approved design files and assets received from design team', isRequired: true, order: 0 },
      { department: 'HTML', title: 'HTML structure completed', description: 'Complete HTML structure implemented according to designs', isRequired: true, order: 1 },
      { department: 'HTML', title: 'CSS styling implemented', description: 'All CSS styling completed to match approved designs', isRequired: true, order: 2 },
      { department: 'HTML', title: 'Responsive design tested', description: 'Design tested and working on mobile, tablet, and desktop', isRequired: true, order: 3 },
      { department: 'HTML', title: 'Cross-browser compatibility verified', description: 'Tested on Chrome, Firefox, Safari, and Edge browsers', isRequired: true, order: 4 },
      { department: 'HTML', title: 'HTML QA testing passed', description: 'Internal HTML QA testing completed successfully', isRequired: true, order: 5 },
      { department: 'HTML', title: 'Code optimization completed', description: 'HTML/CSS code optimized for performance and maintainability', isRequired: false, order: 6 },
      
      // QA Templates
      { department: 'QA', title: 'Test plan created', description: 'Comprehensive test plan covering all functionality', isRequired: true, order: 0 },
      { department: 'QA', title: 'Functional testing completed', description: 'All features tested according to requirements', isRequired: true, order: 1 },
      { department: 'QA', title: 'Cross-browser testing completed', description: 'Testing completed on all required browsers', isRequired: true, order: 2 },
      { department: 'QA', title: 'Mobile responsiveness tested', description: 'Responsive design tested on various devices', isRequired: true, order: 3 },
      { department: 'QA', title: 'Performance testing completed', description: 'Load times and performance metrics verified', isRequired: true, order: 4 },
      { department: 'QA', title: 'Security testing completed', description: 'Basic security vulnerabilities checked', isRequired: true, order: 5 },
      { department: 'QA', title: 'Bug report documentation', description: 'All bugs documented with steps to reproduce', isRequired: true, order: 6 },
      { department: 'QA', title: 'Final QA approval', description: 'QA team lead approval for release', isRequired: true, order: 7 },
    ],
  });

  console.log('✅ Checklist templates created');

  // Get the initial department history records created with projects
  const roomAppHistory = await prisma.projectDepartmentHistory.findFirst({
    where: { projectId: roomApp.id },
    orderBy: { createdAt: 'asc' },
  });

  const ecommerceHistory1 = await prisma.projectDepartmentHistory.findFirst({
    where: { projectId: ecommerceProject.id },
    orderBy: { createdAt: 'asc' },
  });

  const rastenaHistory1 = await prisma.projectDepartmentHistory.findFirst({
    where: { projectId: rastenaTrading.id },
    orderBy: { createdAt: 'asc' },
  });

  console.log('✅ Department history retrieved');

  // Create department corrections
  if (roomAppHistory) {
    await prisma.departmentCorrection.create({
      data: {
        historyId: roomAppHistory.id,
        correctionType: 'Component Structure',
        description: 'Need to refactor components for better reusability and performance',
        priority: Priority.HIGH,
        status: 'RESOLVED',
        estimatedHours: 8,
        actualHours: 10,
        requestedById: designer.id,
        assignedToId: arjun.id,
        resolutionNotes: 'Refactored components using custom hooks and memo optimization',
        resolvedAt: new Date('2024-08-20'),
      },
    });
  }

  if (ecommerceHistory1) {
    await prisma.departmentCorrection.create({
      data: {
        historyId: ecommerceHistory1.id,
        correctionType: 'Payment Flow Bug',
        description: 'Payment confirmation not working properly on mobile devices',
        priority: Priority.URGENT,
        status: 'IN_PROGRESS',
        estimatedHours: 6,
        requestedById: projectManager.id,
        assignedToId: arjun.id,
      },
    });
  }

  if (rastenaHistory1) {
    await prisma.departmentCorrection.create({
      data: {
        historyId: rastenaHistory1.id,
        correctionType: 'Design Review',
        description: 'Client wants changes to the color scheme and layout',
        priority: Priority.MEDIUM,
        status: 'OPEN',
        estimatedHours: 4,
        requestedById: client.id,
        assignedToId: designer.id,
      },
    });
  }

  console.log('✅ Department corrections created');

  // Create Category Master data
  console.log('🔧 Creating category master data...');
  
  const mobileAppCategory = await prisma.categoryMaster.upsert({
    where: { code: 'MOBILE_APP' },
    update: {},
    create: {
      name: 'Mobile Application',
      code: 'MOBILE_APP',
      description: 'Native and hybrid mobile applications for iOS and Android',
      defaultStartDept: 'PMO',
      estimatedTotalHours: 800,
    },
  });

  const reactNodejsCategory = await prisma.categoryMaster.upsert({
    where: { code: 'REACT_NODEJS' },
    update: {},
    create: {
      name: 'React + Node.js Application',
      code: 'REACT_NODEJS',
      description: 'Full-stack web applications using React frontend and Node.js backend',
      defaultStartDept: 'PMO',
      estimatedTotalHours: 600,
    },
  });

  const advancedPhpCategory = await prisma.categoryMaster.upsert({
    where: { code: 'ADVANCED_PHP' },
    update: {},
    create: {
      name: 'Advanced PHP Application',
      code: 'ADVANCED_PHP',
      description: 'Complex PHP applications with custom frameworks and integrations',
      defaultStartDept: 'PMO',
      estimatedTotalHours: 500,
    },
  });

  const customPhpCategory = await prisma.categoryMaster.upsert({
    where: { code: 'CUSTOM_PHP' },
    update: {},
    create: {
      name: 'Custom PHP Development',
      code: 'CUSTOM_PHP',
      description: 'Custom PHP applications and systems',
      defaultStartDept: 'PMO',
      estimatedTotalHours: 400,
    },
  });

  const ecommerceCategory = await prisma.categoryMaster.upsert({
    where: { code: 'ECOMMERCE' },
    update: {},
    create: {
      name: 'E-commerce Platform',
      code: 'ECOMMERCE',
      description: 'Online shopping platforms and e-commerce solutions',
      defaultStartDept: 'PMO',
      estimatedTotalHours: 700,
    },
  });

  const businessCollateralCategory = await prisma.categoryMaster.upsert({
    where: { code: 'BUSINESS_COLLATERAL' },
    update: {},
    create: {
      name: 'Business Collateral',
      code: 'BUSINESS_COLLATERAL',
      description: 'Marketing materials, brochures, and business presentations',
      defaultStartDept: 'DESIGN',
      estimatedTotalHours: 80,
    },
  });

  console.log('✅ Category master data created');

  // Create Category Department Mappings
  console.log('🔧 Creating department mappings...');

  // Mobile App workflow: PMO -> DESIGN -> HTML -> REACT -> QA -> DELIVERY
  await prisma.categoryDepartmentMapping.createMany({
    data: [
      { categoryId: mobileAppCategory.id, department: 'PMO', sequence: 1, isRequired: true, estimatedHours: 80, estimatedDays: 10 },
      { categoryId: mobileAppCategory.id, department: 'DESIGN', sequence: 2, isRequired: true, estimatedHours: 120, estimatedDays: 15 },
      { categoryId: mobileAppCategory.id, department: 'HTML', sequence: 3, isRequired: false, estimatedHours: 40, estimatedDays: 5 },
      { categoryId: mobileAppCategory.id, department: 'REACT', sequence: 4, isRequired: true, estimatedHours: 400, estimatedDays: 60 },
      { categoryId: mobileAppCategory.id, department: 'QA', sequence: 5, isRequired: true, estimatedHours: 120, estimatedDays: 20 },
      { categoryId: mobileAppCategory.id, department: 'DELIVERY', sequence: 6, isRequired: true, estimatedHours: 40, estimatedDays: 10 },
    ],
    skipDuplicates: true,
  });

  // React + Node.js workflow: PMO -> DESIGN -> HTML -> REACT -> QA -> DELIVERY
  await prisma.categoryDepartmentMapping.createMany({
    data: [
      { categoryId: reactNodejsCategory.id, department: 'PMO', sequence: 1, isRequired: true, estimatedHours: 60, estimatedDays: 8 },
      { categoryId: reactNodejsCategory.id, department: 'DESIGN', sequence: 2, isRequired: true, estimatedHours: 80, estimatedDays: 12 },
      { categoryId: reactNodejsCategory.id, department: 'HTML', sequence: 3, isRequired: true, estimatedHours: 80, estimatedDays: 10 },
      { categoryId: reactNodejsCategory.id, department: 'REACT', sequence: 4, isRequired: true, estimatedHours: 280, estimatedDays: 40 },
      { categoryId: reactNodejsCategory.id, department: 'QA', sequence: 5, isRequired: true, estimatedHours: 80, estimatedDays: 15 },
      { categoryId: reactNodejsCategory.id, department: 'DELIVERY', sequence: 6, isRequired: true, estimatedHours: 20, estimatedDays: 5 },
    ],
    skipDuplicates: true,
  });

  // Advanced PHP workflow: PMO -> DESIGN -> HTML -> PHP -> QA -> DELIVERY
  await prisma.categoryDepartmentMapping.createMany({
    data: [
      { categoryId: advancedPhpCategory.id, department: 'PMO', sequence: 1, isRequired: true, estimatedHours: 50, estimatedDays: 7 },
      { categoryId: advancedPhpCategory.id, department: 'DESIGN', sequence: 2, isRequired: true, estimatedHours: 70, estimatedDays: 10 },
      { categoryId: advancedPhpCategory.id, department: 'HTML', sequence: 3, isRequired: true, estimatedHours: 60, estimatedDays: 8 },
      { categoryId: advancedPhpCategory.id, department: 'PHP', sequence: 4, isRequired: true, estimatedHours: 240, estimatedDays: 35 },
      { categoryId: advancedPhpCategory.id, department: 'QA', sequence: 5, isRequired: true, estimatedHours: 60, estimatedDays: 10 },
      { categoryId: advancedPhpCategory.id, department: 'DELIVERY', sequence: 6, isRequired: true, estimatedHours: 20, estimatedDays: 5 },
    ],
    skipDuplicates: true,
  });

  // E-commerce workflow: PMO -> DESIGN -> HTML -> PHP -> QA -> DELIVERY
  await prisma.categoryDepartmentMapping.createMany({
    data: [
      { categoryId: ecommerceCategory.id, department: 'PMO', sequence: 1, isRequired: true, estimatedHours: 80, estimatedDays: 12 },
      { categoryId: ecommerceCategory.id, department: 'DESIGN', sequence: 2, isRequired: true, estimatedHours: 100, estimatedDays: 15 },
      { categoryId: ecommerceCategory.id, department: 'HTML', sequence: 3, isRequired: true, estimatedHours: 80, estimatedDays: 12 },
      { categoryId: ecommerceCategory.id, department: 'PHP', sequence: 4, isRequired: true, estimatedHours: 320, estimatedDays: 48 },
      { categoryId: ecommerceCategory.id, department: 'QA', sequence: 5, isRequired: true, estimatedHours: 100, estimatedDays: 15 },
      { categoryId: ecommerceCategory.id, department: 'DELIVERY', sequence: 6, isRequired: true, estimatedHours: 20, estimatedDays: 3 },
    ],
    skipDuplicates: true,
  });

  // Business Collateral workflow: DESIGN -> DELIVERY (simplified workflow)
  await prisma.categoryDepartmentMapping.createMany({
    data: [
      { categoryId: businessCollateralCategory.id, department: 'DESIGN', sequence: 1, isRequired: true, estimatedHours: 60, estimatedDays: 10 },
      { categoryId: businessCollateralCategory.id, department: 'DELIVERY', sequence: 2, isRequired: true, estimatedHours: 20, estimatedDays: 5 },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Department mappings created');

  // Generate and update project codes for all projects
  const allProjects = await prisma.project.findMany({
    include: {
      departmentHistory: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  for (const project of allProjects) {
    const projectCode = generateProjectCode(project.departmentHistory);
    await prisma.project.update({
      where: { id: project.id },
      data: { projectCode },
    });
  }

  console.log('✅ Project codes generated and updated');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Sample users:');
  console.log('👤 Admin: admin@intersmart.com / password123');
  console.log('👤 PM: pm@intersmart.com / password123'); 
  console.log('👤 Developer: arjun@intersmart.com / password123');
  console.log('👤 Designer: designer@intersmart.com / password123');
  console.log('👤 Client: client@example.com / password123');
  console.log('👤 Senior Manager: senior.manager@intersmart.com / password123');
  console.log('👤 Operations Manager: ops.manager@intersmart.com / password123');
  console.log('👤 Regional Manager: regional.manager@intersmart.com / password123');
  console.log('👤 Department Head: dept.head@intersmart.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });