import { PrismaClient, Role, ProjectCategory, ProjectStatus, TaskStatus, Priority, Department, DepartmentWorkStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generateProjectCode } from '../src/utils/project-code.util';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@intersmart.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const projectManager = await prisma.user.create({
    data: {
      email: 'pm@intersmart.com',
      name: 'Project Manager',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      department: Department.PMO,
    },
  });

  const arjun = await prisma.user.create({
    data: {
      email: 'arjun@intersmart.com',
      name: 'Arjun Developer',
      password: hashedPassword,
      role: Role.DEVELOPER,
      department: Department.REACT,
    },
  });

  const designer = await prisma.user.create({
    data: {
      email: 'designer@intersmart.com',
      name: 'UI Designer',
      password: hashedPassword,
      role: Role.DESIGNER,
      department: Department.DESIGN,
    },
  });

  const client = await prisma.user.create({
    data: {
      email: 'client@example.com',
      name: 'Client User',
      password: hashedPassword,
      role: Role.CLIENT,
    },
  });

  const seniorManager = await prisma.user.create({
    data: {
      email: 'senior.manager@intersmart.com',
      name: 'Senior Manager',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      department: Department.MANAGER,
    },
  });

  const operationsManager = await prisma.user.create({
    data: {
      email: 'ops.manager@intersmart.com',
      name: 'Operations Manager',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      department: Department.MANAGER,
    },
  });

  const regionalManager = await prisma.user.create({
    data: {
      email: 'regional.manager@intersmart.com',
      name: 'Regional Manager',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      department: Department.MANAGER,
    },
  });

  const departmentHead = await prisma.user.create({
    data: {
      email: 'dept.head@intersmart.com',
      name: 'Department Head',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
      department: Department.MANAGER,
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