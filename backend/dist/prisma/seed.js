"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const project_code_util_1 = require("../src/utils/project-code.util");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@intersmart.com',
            name: 'Admin User',
            password: hashedPassword,
            role: client_1.Role.ADMIN,
        },
    });
    const projectManager = await prisma.user.create({
        data: {
            email: 'pm@intersmart.com',
            name: 'Project Manager',
            password: hashedPassword,
            role: client_1.Role.PROJECT_MANAGER,
            department: client_1.Department.PMO,
        },
    });
    const arjun = await prisma.user.create({
        data: {
            email: 'arjun@intersmart.com',
            name: 'Arjun Developer',
            password: hashedPassword,
            role: client_1.Role.DEVELOPER,
            department: client_1.Department.REACT,
        },
    });
    const designer = await prisma.user.create({
        data: {
            email: 'designer@intersmart.com',
            name: 'UI Designer',
            password: hashedPassword,
            role: client_1.Role.DESIGNER,
            department: client_1.Department.DESIGN,
        },
    });
    const client = await prisma.user.create({
        data: {
            email: 'client@example.com',
            name: 'Client User',
            password: hashedPassword,
            role: client_1.Role.CLIENT,
        },
    });
    const seniorManager = await prisma.user.create({
        data: {
            email: 'senior.manager@intersmart.com',
            name: 'Senior Manager',
            password: hashedPassword,
            role: client_1.Role.PROJECT_MANAGER,
            department: client_1.Department.MANAGER,
        },
    });
    const operationsManager = await prisma.user.create({
        data: {
            email: 'ops.manager@intersmart.com',
            name: 'Operations Manager',
            password: hashedPassword,
            role: client_1.Role.PROJECT_MANAGER,
            department: client_1.Department.MANAGER,
        },
    });
    const regionalManager = await prisma.user.create({
        data: {
            email: 'regional.manager@intersmart.com',
            name: 'Regional Manager',
            password: hashedPassword,
            role: client_1.Role.PROJECT_MANAGER,
            department: client_1.Department.MANAGER,
        },
    });
    const departmentHead = await prisma.user.create({
        data: {
            email: 'dept.head@intersmart.com',
            name: 'Department Head',
            password: hashedPassword,
            role: client_1.Role.PROJECT_MANAGER,
            department: client_1.Department.MANAGER,
        },
    });
    console.log('✅ Users created');
    const roomApp = await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
            data: {
                name: 'Room App',
                office: 'Dubai',
                category: client_1.ProjectCategory.MOBILE_APP,
                pagesCount: 15,
                currentDepartment: client_1.Department.REACT,
                nextDepartment: client_1.Department.QA,
                targetDate: new Date('2024-12-31'),
                status: client_1.ProjectStatus.ACTIVE,
                clientName: 'Room Holdings LLC',
                observations: 'Mobile app for room booking and management',
                ownerId: arjun.id,
                startDate: new Date('2024-01-15'),
            },
        });
        await tx.projectDepartmentHistory.create({
            data: {
                projectId: project.id,
                fromDepartment: null,
                toDepartment: client_1.Department.REACT,
                workStatus: client_1.DepartmentWorkStatus.IN_PROGRESS,
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
                category: client_1.ProjectCategory.REACT_NODEJS,
                pagesCount: 25,
                currentDepartment: client_1.Department.DELIVERY,
                targetDate: new Date('2024-11-30'),
                status: client_1.ProjectStatus.ACTIVE,
                clientName: 'Shayan Royal Hotel',
                observations: 'Hotel management system with booking capabilities',
                ownerId: projectManager.id,
                startDate: new Date('2024-02-01'),
                monthsPassed: 6,
            },
        });
        await tx.projectDepartmentHistory.create({
            data: {
                projectId: project.id,
                fromDepartment: null,
                toDepartment: client_1.Department.DELIVERY,
                workStatus: client_1.DepartmentWorkStatus.COMPLETED,
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
                category: client_1.ProjectCategory.ADVANCED_PHP,
                pagesCount: 30,
                currentDepartment: client_1.Department.PHP,
                nextDepartment: client_1.Department.QA,
                targetDate: new Date('2025-01-15'),
                status: client_1.ProjectStatus.HOLD,
                clientName: 'Rastena General Trading LLC',
                observations: 'Trading company website with inventory management',
                deviationReason: 'Client requested additional features',
                ownerId: client.id,
                startDate: new Date('2024-03-01'),
                monthsPassed: 5,
            },
        });
        await tx.projectDepartmentHistory.create({
            data: {
                projectId: project.id,
                fromDepartment: null,
                toDepartment: client_1.Department.PHP,
                workStatus: client_1.DepartmentWorkStatus.ON_HOLD,
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
                category: client_1.ProjectCategory.NEXT_JS,
                pagesCount: 40,
                currentDepartment: client_1.Department.QA,
                nextDepartment: client_1.Department.DELIVERY,
                targetDate: new Date('2024-10-30'),
                status: client_1.ProjectStatus.ACTIVE,
                clientName: 'Digital Commerce Inc.',
                observations: 'Modern e-commerce platform with admin dashboard',
                ownerId: projectManager.id,
                startDate: new Date('2024-01-01'),
                monthsPassed: 7,
            },
        });
        await tx.projectDepartmentHistory.create({
            data: {
                projectId: project.id,
                fromDepartment: null,
                toDepartment: client_1.Department.QA,
                workStatus: client_1.DepartmentWorkStatus.QA_TESTING,
                movedById: projectManager.id,
                permissionGrantedById: admin.id,
                notes: 'Initial project creation in QA department',
            },
        });
        return project;
    });
    console.log('✅ Projects created');
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
    const tasks = await prisma.task.createMany({
        data: [
            {
                title: 'User Authentication System',
                description: 'Implement JWT-based authentication with role management',
                status: client_1.TaskStatus.DONE,
                priority: client_1.Priority.HIGH,
                assigneeId: arjun.id,
                projectId: roomApp.id,
                dueDate: new Date('2024-08-15'),
            },
            {
                title: 'Room Booking Interface',
                description: 'Create mobile interface for room booking functionality',
                status: client_1.TaskStatus.IN_PROGRESS,
                priority: client_1.Priority.HIGH,
                assigneeId: designer.id,
                projectId: roomApp.id,
                dueDate: new Date('2024-09-30'),
            },
            {
                title: 'Payment Integration',
                description: 'Integrate payment gateway for room bookings',
                status: client_1.TaskStatus.TODO,
                priority: client_1.Priority.MEDIUM,
                projectId: roomApp.id,
                dueDate: new Date('2024-10-15'),
            },
            {
                title: 'Database Schema Design',
                description: 'Design and implement database schema for hotel management',
                status: client_1.TaskStatus.DONE,
                priority: client_1.Priority.HIGH,
                assigneeId: projectManager.id,
                projectId: shayanRoyal.id,
                dueDate: new Date('2024-07-01'),
            },
            {
                title: 'Admin Dashboard',
                description: 'Create admin dashboard for hotel management',
                status: client_1.TaskStatus.IN_REVIEW,
                priority: client_1.Priority.HIGH,
                assigneeId: arjun.id,
                projectId: shayanRoyal.id,
                dueDate: new Date('2024-09-15'),
            },
            {
                title: 'Inventory Management Module',
                description: 'Develop inventory tracking and management system',
                status: client_1.TaskStatus.TODO,
                priority: client_1.Priority.MEDIUM,
                projectId: rastenaTrading.id,
                dueDate: new Date('2024-12-01'),
            },
            {
                title: 'Product Catalog System',
                description: 'Build comprehensive product catalog with search and filters',
                status: client_1.TaskStatus.IN_PROGRESS,
                priority: client_1.Priority.HIGH,
                assigneeId: projectManager.id,
                projectId: ecommerceProject.id,
                dueDate: new Date('2024-09-30'),
            },
            {
                title: 'Shopping Cart & Checkout',
                description: 'Implement shopping cart functionality and checkout process',
                status: client_1.TaskStatus.TODO,
                priority: client_1.Priority.HIGH,
                assigneeId: arjun.id,
                projectId: ecommerceProject.id,
                dueDate: new Date('2024-10-15'),
            },
        ],
    });
    console.log('✅ Tasks created');
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
    if (roomAppHistory) {
        await prisma.departmentCorrection.create({
            data: {
                historyId: roomAppHistory.id,
                correctionType: 'Component Structure',
                description: 'Need to refactor components for better reusability and performance',
                priority: client_1.Priority.HIGH,
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
                priority: client_1.Priority.URGENT,
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
                priority: client_1.Priority.MEDIUM,
                status: 'OPEN',
                estimatedHours: 4,
                requestedById: client.id,
                assignedToId: designer.id,
            },
        });
    }
    console.log('✅ Department corrections created');
    const allProjects = await prisma.project.findMany({
        include: {
            departmentHistory: {
                orderBy: { createdAt: 'asc' },
            },
        },
    });
    for (const project of allProjects) {
        const projectCode = (0, project_code_util_1.generateProjectCode)(project.departmentHistory);
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
//# sourceMappingURL=seed.js.map