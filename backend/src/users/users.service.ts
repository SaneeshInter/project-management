import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const password = createUserDto.password || 'inter123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Validate role and department exist
    const role = await this.prisma.roleMaster.findUnique({
      where: { id: createUserDto.roleId }
    });
    const department = await this.prisma.departmentMaster.findUnique({
      where: { id: createUserDto.departmentId }
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${createUserDto.roleId} not found`);
    }
    if (!department) {
      throw new NotFoundException(`Department with ID ${createUserDto.departmentId} not found`);
    }

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        roleId: createUserDto.roleId,
        departmentId: createUserDto.departmentId,
        avatar: createUserDto.avatar,
      },
      include: {
        roleMaster: true,
        departmentMaster: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        roleMaster: true,
        departmentMaster: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roleMaster: true,
        departmentMaster: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        roleMaster: true,
        departmentMaster: true,
      },
    });
  }

  async remove(id: string, force: boolean = false) {
    const user = await this.prisma.user.findUnique({ 
      where: { id },
      include: {
        ownedProjects: true,
        comments: true,
        assignedTasks: true,
        assignedCorrections: true,
        requestedCorrections: true,
        departmentTransitions: true,
        departmentPermissions: true,
        bugAssignments: true,
        qaTestingRounds: true,
        approvalRequests: true,
        approvalReviews: true,
      }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check for related records that would prevent deletion
    const hasRelatedRecords = 
      user.ownedProjects.length > 0 ||
      user.comments.length > 0 ||
      user.assignedTasks.length > 0 ||
      user.assignedCorrections.length > 0 ||
      user.requestedCorrections.length > 0 ||
      user.departmentTransitions.length > 0 ||
      user.departmentPermissions.length > 0 ||
      user.bugAssignments.length > 0 ||
      user.qaTestingRounds.length > 0 ||
      user.approvalRequests.length > 0 ||
      user.approvalReviews.length > 0;

    if (hasRelatedRecords && !force) {
      throw new BadRequestException(
        `Cannot delete ${user.name}. This user has related records (projects, tasks, comments, etc.). Please reassign or remove these records first.`
      );
    }

    if (force && hasRelatedRecords) {
      // Force delete: remove related records in proper cascade order
      await this.prisma.$transaction(async (tx) => {
        // Delete in reverse dependency order to avoid foreign key violations
        
        // 1. Delete QA bugs (depends on QA rounds and users)
        await tx.qABug.deleteMany({ where: { assignedToId: id } });
        
        // 2. Delete QA testing rounds (depends on department history and users)
        await tx.qATestingRound.deleteMany({ where: { testedById: id } });
        
        // 3. Delete workflow approvals (depends on department history and users)
        await tx.workflowApproval.deleteMany({ 
          where: { OR: [{ requestedById: id }, { reviewedById: id }] } 
        });
        
        // 4. Delete department corrections (depends on department history and users)
        await tx.departmentCorrection.deleteMany({ 
          where: { OR: [{ assignedToId: id }, { requestedById: id }] } 
        });
        
        // 5. Delete department history records (depends on projects and users)
        await tx.projectDepartmentHistory.deleteMany({ 
          where: { OR: [{ movedById: id }, { permissionGrantedById: id }] } 
        });
        
        // 6. Delete comments (depends on users, projects, tasks)
        await tx.comment.deleteMany({ where: { authorId: id } });
        
        // 7. Get owned project IDs before deleting projects
        const ownedProjectIds = user.ownedProjects.map(p => p.id);
        
        if (ownedProjectIds.length > 0) {
          // 8. Delete custom fields for owned projects
          await tx.customField.deleteMany({ 
            where: { projectId: { in: ownedProjectIds } } 
          });
          
          // 9. Delete ALL tasks for owned projects (not just assigned to this user)
          await tx.task.deleteMany({ 
            where: { projectId: { in: ownedProjectIds } } 
          });
          
          // 10. Delete remaining comments for owned projects
          await tx.comment.deleteMany({ 
            where: { projectId: { in: ownedProjectIds } } 
          });
          
          // 11. Now safe to delete owned projects
          await tx.project.deleteMany({ where: { ownerId: id } });
        }
        
        // 12. Unassign tasks from other projects where user was assigned
        await tx.task.updateMany({ 
          where: { 
            assigneeId: id,
            projectId: { notIn: ownedProjectIds } 
          }, 
          data: { assigneeId: null } 
        });
        
        // 13. Finally delete the user
        await tx.user.delete({ where: { id } });
      });
      
      return { message: `User ${user.name} and all related records deleted successfully` };
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  async getPMOCoordinators() {
    return this.prisma.user.findMany({
      where: {
        departmentMaster: {
          code: 'PMO'
        },
        roleMaster: {
          code: {
            in: ['PC', 'PC_TL1', 'PC_TL2']
          }
        }
      },
      include: {
        roleMaster: true,
        departmentMaster: true,
      },
      orderBy: [
        { roleMaster: { code: 'asc' } },
        { name: 'asc' }
      ]
    });
  }
}