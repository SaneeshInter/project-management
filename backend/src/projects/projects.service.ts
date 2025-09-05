import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateDepartmentTransitionDto } from './dto/create-department-transition.dto';
import { UpdateDepartmentWorkStatusDto } from './dto/update-department-work-status.dto';
import { UpdateChecklistItemDto, CreateChecklistItemLinkDto, CreateChecklistItemUpdateDto } from './dto/update-checklist-item.dto';
import { DisableProjectDto } from './dto/disable-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { User, Role, DepartmentWorkStatus, Department, ProjectStatus, ProjectAssignmentType } from '@prisma/client';
import { generateProjectCode } from '../utils/project-code.util';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User) {
    console.log('🔍 Creating project with data:', createProjectDto);
    console.log('🔍 User creating project:', user.id, user.name);
    
    // Validate department IDs exist
    const currentDepartment = await this.prisma.departmentMaster.findUnique({
      where: { id: createProjectDto.currentDepartmentId }
    });
    if (!currentDepartment) {
      throw new NotFoundException(`Current department with ID ${createProjectDto.currentDepartmentId} not found`);
    }

    if (createProjectDto.nextDepartmentId) {
      const nextDepartment = await this.prisma.departmentMaster.findUnique({
        where: { id: createProjectDto.nextDepartmentId }
      });
      if (!nextDepartment) {
        throw new NotFoundException(`Next department with ID ${createProjectDto.nextDepartmentId} not found`);
      }
    }
    
    // Create the project first
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        office: createProjectDto.office,
        category: createProjectDto.category,
        pagesCount: createProjectDto.pagesCount,
        currentDepartment: currentDepartment.code as Department,
        nextDepartment: createProjectDto.nextDepartmentId ? 
          (await this.prisma.departmentMaster.findUnique({ where: { id: createProjectDto.nextDepartmentId } }))?.code as Department :
          undefined,
        targetDate: createProjectDto.targetDate,
        status: createProjectDto.status,
        clientName: createProjectDto.clientName,
        observations: createProjectDto.observations,
        deviationReason: createProjectDto.deviationReason,
        dependency: createProjectDto.dependency,
        startDate: createProjectDto.startDate,
        projectCoordinatorId: createProjectDto.projectCoordinatorId,
        pcTeamLeadId: createProjectDto.pcTeamLeadId,
        ownerId: user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        projectCoordinator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        pcTeamLead: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            comments: true,
          },
        },
      },
    });

    console.log('✅ Project created:', project.id, project.name);

    // Create initial department history record separately
    try {
      const departmentHistory = await this.prisma.projectDepartmentHistory.create({
        data: {
          projectId: project.id,
          fromDepartment: null,
          toDepartment: currentDepartment.code as Department,
          workStatus: DepartmentWorkStatus.NOT_STARTED,
          movedById: user.id,
          permissionGrantedById: user.id,
          notes: 'Initial project creation',
        },
      });
      
      console.log('✅ Department history created:', departmentHistory.id);
    } catch (historyError) {
      console.error('❌ Failed to create department history:', historyError);
      // Don't fail the project creation, just log the error for now
    }

    // Create assignment history records for PC and PC TL if assigned
    try {
      if (createProjectDto.projectCoordinatorId) {
        await this.prisma.projectAssignmentHistory.create({
          data: {
            projectId: project.id,
            assignmentType: ProjectAssignmentType.PROJECT_COORDINATOR,
            newUserId: createProjectDto.projectCoordinatorId,
            assignedById: user.id,
            reason: 'Initial project creation',
          },
        });
      }

      if (createProjectDto.pcTeamLeadId) {
        await this.prisma.projectAssignmentHistory.create({
          data: {
            projectId: project.id,
            assignmentType: ProjectAssignmentType.PC_TEAM_LEAD,
            newUserId: createProjectDto.pcTeamLeadId,
            assignedById: user.id,
            reason: 'Initial project creation',
          },
        });
      }
    } catch (assignmentError) {
      console.error('❌ Failed to create assignment history:', assignmentError);
    }

    return project;
  }

  async findAll(userId?: string, role?: Role, user?: User) {
    let where: any = {
      disabled: false, // Only show active projects by default
    };

    // Get user with department info for filtering
    const userWithDept = userId ? await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        departmentMaster: true,
        roleMaster: true,
      },
    }) : null;

    // Role-based filtering - use roleMaster.code primarily
    const roleCode = userWithDept?.roleMaster?.code || role?.toString();
    
    if (roleCode === 'CLIENT') {
      // Clients only see their own projects
      where = { ...where, ownerId: userId };
    } else if (roleCode === 'ADMIN' || roleCode === 'SU_ADMIN' || roleCode === 'PROJECT_MANAGER') {
      // Super users see all projects (but still filter disabled by default)
      where = { disabled: false };
    } else if (userWithDept?.departmentMaster?.code === 'PMO') {
      // PMO users only see assigned projects
      where = {
        ...where,
        OR: [
          { projectCoordinatorId: userId },
          { pcTeamLeadId: userId },
        ],
      };
    } else if (userWithDept?.departmentMaster?.code) {
      // Other department users see projects in their department or that they've worked on
      where = {
        ...where,
        OR: [
          { currentDepartment: userWithDept.departmentMaster.code },
          {
            departmentHistory: {
              some: {
                toDepartment: userWithDept.departmentMaster.code,
              },
            },
          },
        ],
      };
    }

    return this.prisma.project.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        projectCoordinator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: User) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                comments: true,
              },
            },
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        customFields: true,
        departmentHistory: {
          include: {
            movedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            permissionGrantedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            corrections: {
              include: {
                requestedBy: {
                  select: { id: true, name: true, email: true, role: true },
                },
                assignedTo: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
              orderBy: { requestedAt: 'desc' },
            },
            approvals: {
              include: {
                requestedBy: {
                  select: { id: true, name: true, email: true, role: true },
                },
                reviewedBy: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
              orderBy: { requestedAt: 'desc' },
            },
            qaRounds: {
              include: {
                testedBy: {
                  select: { id: true, name: true, email: true, role: true },
                },
                bugs: {
                  include: {
                    assignedTo: {
                      select: { id: true, name: true, email: true, role: true },
                    },
                  },
                  orderBy: { foundAt: 'desc' },
                },
              },
              orderBy: { roundNumber: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check access permissions
    if (user.role === Role.CLIENT && project.ownerId !== user.id) {
      throw new ForbiddenException('Access denied to this project');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: User) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check permissions
    if (user.role === Role.CLIENT && project.ownerId !== user.id) {
      throw new ForbiddenException('You can only update your own projects');
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            comments: true,
          },
        },
      },
    });
  }

  async remove(id: string, user: User) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Only admins and project owners can delete projects
    if (user.role !== Role.ADMIN && project.ownerId !== user.id) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project deleted successfully' };
  }

  async addCustomField(projectId: string, fieldName: string, fieldValue: string, user: User) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (user.role === Role.CLIENT && project.ownerId !== user.id) {
      throw new ForbiddenException('Access denied to this project');
    }

    return this.prisma.customField.create({
      data: {
        fieldName,
        fieldValue,
        projectId,
      },
    });
  }

  async moveToDepartment(projectId: string, transitionDto: CreateDepartmentTransitionDto, user: User) {
    const project = await this.prisma.project.findUnique({ 
      where: { id: projectId },
      include: {
        departmentHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Create the transition using a transaction
    return this.prisma.$transaction(async (tx) => {
      // Get current department checklist progress to record in history
      let checklistProgress = null;
      try {
        checklistProgress = await this.getChecklistProgress(projectId, project.currentDepartment.toString(), user);
      } catch (error) {
        console.warn('Could not fetch checklist progress for history:', error.message);
      }

      // Create department history record
      const checklistInfo = checklistProgress ? 
        `Checklist: ${checklistProgress.completedItems}/${checklistProgress.totalItems} items completed (${checklistProgress.completedRequiredItems}/${checklistProgress.requiredItems} required)` : 
        null;

      // Resolve assignedToId to user name if provided
      let assignedToName = null;
      if (transitionDto.assignedToId) {
        const assignedUser = await tx.user.findUnique({
          where: { id: transitionDto.assignedToId },
          select: { name: true }
        });
        assignedToName = assignedUser?.name || transitionDto.assignedToId;
      }

      const enhancedNotes = [
        checklistInfo,
        transitionDto.notes,
        transitionDto.ktNotes ? `KT Notes: ${transitionDto.ktNotes}` : null,
        transitionDto.ktDocuments && transitionDto.ktDocuments.length > 0 
          ? `KT Documents: ${transitionDto.ktDocuments.join(', ')}` : null,
        transitionDto.expectedStartDate ? `Expected Start: ${transitionDto.expectedStartDate}` : null,
        transitionDto.expectedEndDate ? `Expected End: ${transitionDto.expectedEndDate}` : null,
        transitionDto.estimatedHours ? `Estimated Hours: ${transitionDto.estimatedHours}` : null,
        assignedToName ? `Assigned To: ${assignedToName}` : null,
      ].filter(Boolean).join(' | ');

      await tx.projectDepartmentHistory.create({
        data: {
          projectId,
          fromDepartment: project.currentDepartment,
          toDepartment: transitionDto.toDepartment,
          estimatedDays: transitionDto.estimatedDays,
          workStatus: DepartmentWorkStatus.NOT_STARTED,
          movedById: user.id,
          permissionGrantedById: transitionDto.permissionGrantedById || user.id,
          notes: enhancedNotes || transitionDto.notes,
        },
      });

      // Generate updated project code based on completed departments
      const newProjectCode = generateProjectCode(project.departmentHistory);

      // Update project's current department and code
      return tx.project.update({
        where: { id: projectId },
        data: {
          currentDepartment: transitionDto.toDepartment,
          projectCode: newProjectCode,
          // Optionally set nextDepartment based on business logic
          // This could be enhanced with a department workflow service
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              department: true,
            },
          },
          departmentHistory: {
            include: {
              movedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              tasks: true,
              comments: true,
            },
          },
        },
      });
    });
  }

  async getDepartmentHistory(projectId: string, user: User) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check access permissions
    if (user.role === Role.CLIENT && project.ownerId !== user.id) {
      throw new ForbiddenException('Access denied to this project');
    }

    return this.prisma.projectDepartmentHistory.findMany({
      where: { projectId },
      include: {
        movedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateDepartmentWorkStatus(projectId: string, statusDto: UpdateDepartmentWorkStatusDto, user: User) {
    const project = await this.prisma.project.findUnique({ 
      where: { id: projectId },
      include: {
        departmentHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Find the current department history entry
    let currentDepartmentHistory = await this.prisma.projectDepartmentHistory.findFirst({
      where: {
        projectId,
        toDepartment: project.currentDepartment,
      },
      orderBy: { createdAt: 'desc' },
    });

    // If no history record exists for current department, create one
    if (!currentDepartmentHistory) {
      currentDepartmentHistory = await this.prisma.projectDepartmentHistory.create({
        data: {
          projectId,
          fromDepartment: null,
          toDepartment: project.currentDepartment,
          workStatus: DepartmentWorkStatus.NOT_STARTED,
          movedById: user.id,
          permissionGrantedById: user.id,
          notes: 'Auto-created missing department history record',
        },
      });
    }

    // Calculate actual days if work is completed
    let actualDays = statusDto.actualDays;
    if (statusDto.workStatus === DepartmentWorkStatus.COMPLETED && 
        statusDto.workStartDate && statusDto.workEndDate) {
      const startDate = new Date(statusDto.workStartDate);
      const endDate = new Date(statusDto.workEndDate);
      actualDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Use transaction to update both history and project code
    return this.prisma.$transaction(async (tx) => {
      // Update department history
      const updatedHistory = await tx.projectDepartmentHistory.update({
        where: { id: currentDepartmentHistory.id },
        data: {
          workStatus: statusDto.workStatus,
          workStartDate: statusDto.workStartDate ? new Date(statusDto.workStartDate) : undefined,
          workEndDate: statusDto.workEndDate ? new Date(statusDto.workEndDate) : undefined,
          actualDays,
          notes: statusDto.notes || currentDepartmentHistory.notes,
        },
      });

      // If work is completed, regenerate project code
      if (statusDto.workStatus === DepartmentWorkStatus.COMPLETED) {
        // Get updated department history for code generation
        const allHistory = await tx.projectDepartmentHistory.findMany({
          where: { projectId },
          orderBy: { createdAt: 'asc' },
        });

        const newProjectCode = generateProjectCode(allHistory);

        // Update project code
        await tx.project.update({
          where: { id: projectId },
          data: { projectCode: newProjectCode },
        });
      }

      // Return the updated history with relations
      return tx.projectDepartmentHistory.findUnique({
        where: { id: updatedHistory.id },
        include: {
          movedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          permissionGrantedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          corrections: {
            include: {
              requestedBy: {
                select: { id: true, name: true, email: true, role: true },
              },
              assignedTo: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
            orderBy: { requestedAt: 'desc' },
          },
        },
      });
    });
  }


  // Department Checklist Methods
  async getChecklistProgress(projectId: string, department?: string, user?: User) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const targetDepartment = department || project.currentDepartment;

    // Get or create checklist items for this project and department
    let checklistItems = await this.prisma.projectChecklistItem.findMany({
      where: { 
        projectId,
        department: targetDepartment as Department
      },
      include: {
        template: true,
        completedBy: { select: { id: true, name: true, email: true } },
        lastUpdatedBy: { select: { id: true, name: true, email: true } },
        links: {
          include: {
            addedBy: { select: { id: true, name: true, email: true } }
          }
        },
        updateHistory: {
          include: {
            updatedBy: { select: { id: true, name: true, email: true } }
          },
          orderBy: { updatedAt: 'desc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    // If no items exist, create them from templates
    if (checklistItems.length === 0) {
      const templates = await this.prisma.checklistTemplate.findMany({
        where: { 
          department: targetDepartment,
          isActive: true 
        },
        orderBy: { order: 'asc' }
      });

      if (templates.length > 0) {
        const createData = templates.map(template => ({
          projectId,
          templateId: template.id,
          department: targetDepartment as Department,
          title: template.title,
          description: template.description,
          isRequired: template.isRequired,
          order: template.order
        }));

        await this.prisma.projectChecklistItem.createMany({
          data: createData
        });

        // Fetch the newly created items
        checklistItems = await this.prisma.projectChecklistItem.findMany({
          where: { 
            projectId,
            department: targetDepartment as Department
          },
          include: {
            template: true,
            completedBy: { select: { id: true, name: true, email: true } },
            lastUpdatedBy: { select: { id: true, name: true, email: true } },
            links: {
              include: {
                addedBy: { select: { id: true, name: true, email: true } }
              }
            },
            updateHistory: {
              include: {
                updatedBy: { select: { id: true, name: true, email: true } }
              },
              orderBy: { updatedAt: 'desc' }
            }
          },
          orderBy: { order: 'asc' }
        });
      }
    }

    // Calculate progress
    const totalItems = checklistItems.length;
    const completedItems = checklistItems.filter(item => item.isCompleted).length;
    const requiredItems = checklistItems.filter(item => item.isRequired).length;
    const completedRequiredItems = checklistItems.filter(item => item.isCompleted && item.isRequired).length;

    return {
      department: targetDepartment,
      totalItems,
      completedItems,
      requiredItems,
      completedRequiredItems,
      completionPercentage: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
      requiredCompletionPercentage: requiredItems > 0 ? (completedRequiredItems / requiredItems) * 100 : 0,
      canProceedToNext: completedRequiredItems === requiredItems,
      items: checklistItems
    };
  }

  async updateChecklistItem(projectId: string, itemId: string, data: UpdateChecklistItemDto, user: User) {
    const item = await this.prisma.projectChecklistItem.findUnique({
      where: { id: itemId, projectId }
    });

    if (!item) {
      throw new NotFoundException(`Checklist item with ID ${itemId} not found`);
    }

    const updateData: any = {
      isCompleted: data.isCompleted,
      notes: data.notes,
      lastUpdatedAt: new Date(),
      lastUpdatedById: user.id
    };

    if (data.isCompleted) {
      updateData.completedAt = new Date();
      updateData.completedById = user.id;
      if (data.completedDate) {
        updateData.completedDate = new Date(data.completedDate);
      }
    } else {
      updateData.completedAt = null;
      updateData.completedById = null;
      updateData.completedDate = null;
    }

    // Update the item
    const updatedItem = await this.prisma.projectChecklistItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        template: true,
        completedBy: { select: { id: true, name: true, email: true } },
        lastUpdatedBy: { select: { id: true, name: true, email: true } },
        links: {
          include: {
            addedBy: { select: { id: true, name: true, email: true } }
          }
        },
        updateHistory: {
          include: {
            updatedBy: { select: { id: true, name: true, email: true } }
          },
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    // Handle links
    if (data.links) {
      // Remove existing links
      await this.prisma.checklistItemLink.deleteMany({
        where: { itemId }
      });

      // Add new links
      if (data.links.length > 0) {
        await this.prisma.checklistItemLink.createMany({
          data: data.links.map(link => ({
            itemId,
            url: link.url,
            title: link.title,
            type: link.type,
            addedById: user.id
          }))
        });
      }
    }

    // Add update history entry
    if (data.notes || data.isCompleted !== item.isCompleted) {
      await this.prisma.checklistItemUpdate.create({
        data: {
          itemId,
          date: data.completedDate ? new Date(data.completedDate) : new Date(),
          notes: data.notes || `Item ${data.isCompleted ? 'completed' : 'unchecked'}`,
          updatedById: user.id
        }
      });
    }

    return updatedItem;
  }

  async addChecklistItemLink(projectId: string, itemId: string, linkData: CreateChecklistItemLinkDto, user: User) {
    const item = await this.prisma.projectChecklistItem.findUnique({
      where: { id: itemId, projectId }
    });

    if (!item) {
      throw new NotFoundException(`Checklist item with ID ${itemId} not found`);
    }

    return this.prisma.checklistItemLink.create({
      data: {
        itemId,
        url: linkData.url,
        title: linkData.title,
        type: linkData.type,
        addedById: user.id
      },
      include: {
        addedBy: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async removeChecklistItemLink(projectId: string, itemId: string, linkId: string, user: User) {
    const item = await this.prisma.projectChecklistItem.findUnique({
      where: { id: itemId, projectId }
    });

    if (!item) {
      throw new NotFoundException(`Checklist item with ID ${itemId} not found`);
    }

    await this.prisma.checklistItemLink.delete({
      where: { id: linkId, itemId }
    });

    return { success: true };
  }

  async addChecklistItemUpdate(projectId: string, itemId: string, updateData: CreateChecklistItemUpdateDto, user: User) {
    const item = await this.prisma.projectChecklistItem.findUnique({
      where: { id: itemId, projectId }
    });

    if (!item) {
      throw new NotFoundException(`Checklist item with ID ${itemId} not found`);
    }

    return this.prisma.checklistItemUpdate.create({
      data: {
        itemId,
        date: new Date(updateData.date),
        notes: updateData.notes,
        updatedById: user.id
      },
      include: {
        updatedBy: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async updateProjectStatus(id: string, updateStatusDto: UpdateProjectStatusDto, user: User) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check permissions - only admins can update status
    if (user.role !== Role.ADMIN && user.role !== Role.SU_ADMIN) {
      throw new ForbiddenException('Only administrators can update project status');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        // Add reason to observations if provided
        observations: updateStatusDto.reason ? 
          `${project.observations || ''}\n[Status Change ${new Date().toISOString()}]: ${updateStatusDto.reason}`.trim() :
          project.observations,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        projectCoordinator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            comments: true,
          },
        },
      },
    });
  }

  async disableProject(id: string, disableDto: DisableProjectDto, user: User) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check permissions - only admins can disable/enable projects
    if (user.role !== Role.ADMIN && user.role !== Role.SU_ADMIN) {
      throw new ForbiddenException('Only administrators can disable/enable projects');
    }

    const updateData: any = {
      disabled: disableDto.disabled,
    };

    if (disableDto.disabled) {
      // Disabling the project
      updateData.disabledAt = new Date();
      updateData.disabledBy = user.id;
      
      // Add reason to observations if provided
      if (disableDto.reason) {
        updateData.observations = `${project.observations || ''}\n[Disabled ${new Date().toISOString()}]: ${disableDto.reason}`.trim();
      }
    } else {
      // Enabling the project
      updateData.disabledAt = null;
      updateData.disabledBy = null;
      
      // Add reason to observations if provided
      if (disableDto.reason) {
        updateData.observations = `${project.observations || ''}\n[Enabled ${new Date().toISOString()}]: ${disableDto.reason}`.trim();
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        disabledByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            comments: true,
          },
        },
      },
    });
  }
}