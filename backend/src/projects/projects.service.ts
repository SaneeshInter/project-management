import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WorkflowRulesService } from './services/workflow-rules.service';
import { WorkflowValidatorService } from './services/workflow-validator.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateDepartmentTransitionDto } from './dto/create-department-transition.dto';
import { UpdateDepartmentWorkStatusDto } from './dto/update-department-work-status.dto';
import { CreateCorrectionDto } from './dto/create-correction.dto';
import { UpdateCorrectionDto } from './dto/update-correction.dto';
import { User, Role, DepartmentWorkStatus, CorrectionStatus, ApprovalType, ApprovalStatus, QAType, QAStatus, Department, ProjectStatus, ProjectAssignmentType } from '@prisma/client';
import { generateProjectCode } from '../utils/project-code.util';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private workflowRules: WorkflowRulesService,
    private workflowValidator: WorkflowValidatorService
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User) {
    console.log('🔍 Creating project with data:', createProjectDto);
    console.log('🔍 User creating project:', user.id, user.name);
    
    // Create the project first
    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
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
          toDepartment: createProjectDto.currentDepartment as Department,
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

  async findAll(userId?: string, role?: Role) {
    const where = role === Role.CLIENT 
      ? { ownerId: userId }
      : {};

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
    // First validate workflow permissions
    const permissionCheck = await this.workflowValidator.validateWorkflowPermission(
      projectId, 
      'move_department', 
      user
    );
    
    if (!permissionCheck.valid) {
      throw new ForbiddenException(permissionCheck.errors.join(', '));
    }

    // Validate the department transition
    const transitionCheck = await this.workflowValidator.validateDepartmentTransition(
      projectId,
      transitionDto.toDepartment,
      user
    );

    if (!transitionCheck.valid) {
      throw new BadRequestException(`Workflow validation failed: ${transitionCheck.errors.join(', ')}`);
    }

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
      // Create department history record
      await tx.projectDepartmentHistory.create({
        data: {
          projectId,
          fromDepartment: project.currentDepartment,
          toDepartment: transitionDto.toDepartment,
          estimatedDays: transitionDto.estimatedDays,
          workStatus: DepartmentWorkStatus.NOT_STARTED,
          movedById: user.id,
          permissionGrantedById: transitionDto.permissionGrantedById || user.id,
          notes: transitionDto.notes,
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
    // Validate status update permissions and rules
    const statusValidation = await this.workflowValidator.validateStatusUpdate(
      projectId,
      statusDto.workStatus,
      user
    );

    if (!statusValidation.valid) {
      throw new BadRequestException(`Status update validation failed: ${statusValidation.errors.join(', ')}`);
    }

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

  async createCorrection(projectId: string, historyId: string, correctionDto: CreateCorrectionDto, user: User) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const departmentHistory = await this.prisma.projectDepartmentHistory.findUnique({
      where: { id: historyId },
    });

    if (!departmentHistory || departmentHistory.projectId !== projectId) {
      throw new NotFoundException('Department history not found for this project');
    }

    // Create correction and update department history
    return this.prisma.$transaction(async (tx) => {
      const correction = await tx.departmentCorrection.create({
        data: {
          historyId,
          correctionType: correctionDto.correctionType,
          description: correctionDto.description,
          requestedById: user.id,
          assignedToId: correctionDto.assignedToId,
          priority: correctionDto.priority || 'MEDIUM',
          estimatedHours: correctionDto.estimatedHours,
        },
        include: {
          requestedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // Update department history correction count and status
      await tx.projectDepartmentHistory.update({
        where: { id: historyId },
        data: {
          correctionCount: { increment: 1 },
          workStatus: DepartmentWorkStatus.CORRECTIONS_NEEDED,
        },
      });

      return correction;
    });
  }

  async getProjectCorrections(projectId: string, user: User) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (user.role === Role.CLIENT && project.ownerId !== user.id) {
      throw new ForbiddenException('Access denied to this project');
    }

    return this.prisma.departmentCorrection.findMany({
      where: {
        departmentHistory: {
          projectId,
        },
      },
      include: {
        requestedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        departmentHistory: {
          select: {
            toDepartment: true,
            fromDepartment: true,
            createdAt: true,
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async updateCorrection(projectId: string, correctionId: string, updateDto: UpdateCorrectionDto, user: User) {
    const correction = await this.prisma.departmentCorrection.findUnique({
      where: { id: correctionId },
      include: {
        departmentHistory: true,
      },
    });

    if (!correction || correction.departmentHistory.projectId !== projectId) {
      throw new NotFoundException('Correction not found for this project');
    }

    // Check permissions
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (user.role === Role.CLIENT && project.ownerId !== user.id) {
      throw new ForbiddenException('Access denied to this correction');
    }

    const updateData: any = { ...updateDto };
    
    // If marking as resolved, set resolvedAt timestamp
    if (updateDto.status === CorrectionStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
    }

    return this.prisma.departmentCorrection.update({
      where: { id: correctionId },
      data: updateData,
      include: {
        requestedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async getTimelineAnalytics(projectId: string, user: User) {
    const project = await this.prisma.project.findUnique({ 
      where: { id: projectId },
      include: {
        departmentHistory: {
          include: {
            corrections: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (user.role === Role.CLIENT && project.ownerId !== user.id) {
      throw new ForbiddenException('Access denied to this project');
    }

    // Calculate analytics
    const departmentBreakdown = project.departmentHistory.map(history => {
      const efficiency = history.estimatedDays && history.actualDays 
        ? Math.round((history.estimatedDays / history.actualDays) * 100)
        : 0;

      return {
        department: history.toDepartment,
        estimatedDays: history.estimatedDays,
        actualDays: history.actualDays,
        workStartDate: history.workStartDate?.toISOString(),
        workEndDate: history.workEndDate?.toISOString(),
        correctionCount: history.correctionCount,
        status: history.workStatus,
        efficiency,
      };
    });

    const totalCorrections = project.departmentHistory.reduce(
      (sum, history) => sum + history.correctionCount, 0
    );

    const completedDepartments = project.departmentHistory.filter(
      h => h.workStatus === DepartmentWorkStatus.COMPLETED && h.actualDays
    );

    const totalDuration = completedDepartments.reduce(
      (sum, h) => sum + (h.actualDays || 0), 0
    );

    const averageResolutionTime = project.departmentHistory
      .flatMap(h => h.corrections)
      .filter(c => c.status === CorrectionStatus.RESOLVED && c.actualHours)
      .reduce((sum, c, _, arr) => sum + (c.actualHours || 0) / arr.length, 0);

    const estimateAccuracy = departmentBreakdown
      .filter(d => d.efficiency > 0)
      .reduce((sum, d, _, arr) => sum + d.efficiency / arr.length, 0);

    const bottlenecks = departmentBreakdown
      .filter(d => d.efficiency < 80 && d.actualDays && d.estimatedDays)
      .map(d => d.department);

    return {
      projectId,
      totalDuration,
      departmentBreakdown,
      totalCorrections,
      averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
      estimateAccuracy: Math.round(estimateAccuracy),
      bottlenecks,
    };
  }

  // Enhanced Workflow Methods
  async requestApproval(projectId: string, historyId: string, approvalType: ApprovalType, user: User) {
    const history = await this.prisma.projectDepartmentHistory.findUnique({
      where: { id: historyId },
    });

    if (!history || history.projectId !== projectId) {
      throw new NotFoundException('Department history not found');
    }

    return this.prisma.workflowApproval.create({
      data: {
        historyId,
        approvalType,
        requestedById: user.id,
      },
      include: {
        requestedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async submitApproval(approvalId: string, status: ApprovalStatus, comments?: string, rejectionReason?: string, user?: User) {
    const approval = await this.prisma.workflowApproval.findUnique({
      where: { id: approvalId },
      include: { departmentHistory: true },
    });

    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update approval
      const updatedApproval = await tx.workflowApproval.update({
        where: { id: approvalId },
        data: {
          status,
          reviewedById: user?.id,
          reviewedAt: new Date(),
          comments,
          rejectionReason,
        },
        include: {
          requestedBy: { select: { id: true, name: true, email: true, role: true } },
          reviewedBy: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      // Update department work status based on approval result
      let newWorkStatus: DepartmentWorkStatus;
      if (status === ApprovalStatus.APPROVED) {
        newWorkStatus = DepartmentWorkStatus.COMPLETED;
      } else if (status === ApprovalStatus.REJECTED) {
        newWorkStatus = approval.approvalType === ApprovalType.CLIENT_APPROVAL 
          ? DepartmentWorkStatus.CLIENT_REJECTED 
          : DepartmentWorkStatus.QA_REJECTED;
      } else {
        newWorkStatus = approval.departmentHistory.workStatus;
      }

      await tx.projectDepartmentHistory.update({
        where: { id: approval.historyId },
        data: { workStatus: newWorkStatus },
      });

      return updatedApproval;
    });
  }

  async startQATesting(projectId: string, historyId: string, qaType: QAType, testedById: string, user: User) {
    const history = await this.prisma.projectDepartmentHistory.findUnique({
      where: { id: historyId },
      include: { qaRounds: { orderBy: { roundNumber: 'desc' } } },
    });

    if (!history || history.projectId !== projectId) {
      throw new NotFoundException('Department history not found');
    }

    const nextRoundNumber = (history.qaRounds[0]?.roundNumber || 0) + 1;

    return this.prisma.$transaction(async (tx) => {
      // Update department status to QA_TESTING
      await tx.projectDepartmentHistory.update({
        where: { id: historyId },
        data: { workStatus: DepartmentWorkStatus.QA_TESTING },
      });

      // Create QA testing round
      return tx.qATestingRound.create({
        data: {
          historyId,
          roundNumber: nextRoundNumber,
          qaType,
          testedById,
        },
        include: {
          testedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });
    });
  }

  async completeQATestingRound(qaRoundId: string, status: QAStatus, bugsFound: number, criticalBugs: number, testResults?: string, rejectionReason?: string) {
    const qaRound = await this.prisma.qATestingRound.findUnique({
      where: { id: qaRoundId },
      include: { departmentHistory: true },
    });

    if (!qaRound) {
      throw new NotFoundException('QA testing round not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update QA round
      const updatedRound = await tx.qATestingRound.update({
        where: { id: qaRoundId },
        data: {
          status,
          completedAt: new Date(),
          bugsFound,
          criticalBugs,
          testResults,
          rejectionReason,
        },
        include: {
          testedBy: { select: { id: true, name: true, email: true, role: true } },
          bugs: true,
        },
      });

      // Update department work status
      let newWorkStatus: DepartmentWorkStatus;
      if (status === QAStatus.PASSED) {
        if (qaRound.qaType === QAType.BEFORE_LIVE_QA) {
          newWorkStatus = DepartmentWorkStatus.READY_FOR_DELIVERY;
        } else {
          newWorkStatus = DepartmentWorkStatus.COMPLETED;
        }
      } else if (status === QAStatus.FAILED) {
        newWorkStatus = criticalBugs > 0 ? DepartmentWorkStatus.QA_REJECTED : DepartmentWorkStatus.BUGFIX_IN_PROGRESS;
      } else {
        newWorkStatus = qaRound.departmentHistory.workStatus;
      }

      await tx.projectDepartmentHistory.update({
        where: { id: qaRound.historyId },
        data: { workStatus: newWorkStatus },
      });

      return updatedRound;
    });
  }

  async createQABug(qaRoundId: string, bugData: any, user: User) {
    const qaRound = await this.prisma.qATestingRound.findUnique({
      where: { id: qaRoundId },
      include: {
        departmentHistory: {
          include: { project: true }
        }
      }
    });

    if (!qaRound) {
      throw new NotFoundException('QA testing round not found');
    }

    // Use workflow rules to determine which department should fix this bug
    const targetDepartments = this.workflowRules.getBugFixDepartment(
      bugData.description || '', 
      bugData.title || ''
    );

    // For now, assign to the most appropriate department based on project type
    let assignedDepartment: Department;
    const project = qaRound.departmentHistory.project;
    
    if (targetDepartments.includes(Department.HTML)) {
      assignedDepartment = Department.HTML;
    } else if (project.category.includes('PHP') && targetDepartments.includes(Department.PHP)) {
      assignedDepartment = Department.PHP;
    } else if (targetDepartments.includes(Department.REACT)) {
      assignedDepartment = Department.REACT;
    } else {
      assignedDepartment = Department.HTML; // Default fallback
    }

    return this.prisma.qABug.create({
      data: {
        qaRoundId,
        ...bugData,
        // Add metadata about department assignment
        steps: bugData.steps ? 
          `${bugData.steps}\n\n[Auto-assigned to ${assignedDepartment} based on bug analysis]` :
          `[Auto-assigned to ${assignedDepartment} based on bug analysis]`
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async getWorkflowStatus(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        departmentHistory: {
          include: {
            approvals: {
              include: {
                requestedBy: { select: { id: true, name: true, email: true, role: true } },
                reviewedBy: { select: { id: true, name: true, email: true, role: true } },
              },
            },
            qaRounds: {
              include: {
                testedBy: { select: { id: true, name: true, email: true, role: true } },
                bugs: {
                  include: {
                    assignedTo: { select: { id: true, name: true, email: true, role: true } },
                  },
                },
              },
              orderBy: { roundNumber: 'desc' },
            },
            corrections: {
              include: {
                requestedBy: { select: { id: true, name: true, email: true, role: true } },
                assignedTo: { select: { id: true, name: true, email: true, role: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return project;
  }

  /**
   * Get allowed next departments for workflow enforcement
   */
  async getAllowedNextDepartments(projectId: string, user: User) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.workflowRules.getAllowedNextDepartments(project.currentDepartment);
  }

  /**
   * Get workflow validation status for frontend
   */
  async getWorkflowValidationStatus(projectId: string, user: User) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const allowedDepartments = this.workflowRules.getAllowedNextDepartments(project.currentDepartment);
    const workflowSequence = this.workflowRules.getWorkflowSequence(project.category);
    
    // Get current department history with approvals and QA
    const currentHistory = await this.prisma.projectDepartmentHistory.findFirst({
      where: { 
        projectId: projectId,
        toDepartment: project.currentDepartment 
      },
      include: {
        approvals: true,
        qaRounds: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const currentStatus = currentHistory?.workStatus || DepartmentWorkStatus.NOT_STARTED;
    const approvals = currentHistory?.approvals || [];
    const qaRounds = currentHistory?.qaRounds || [];

    // Check approval gate status
    const approvalGate = this.workflowRules.getApprovalGate(project.currentDepartment);
    const gateStatus = approvalGate ? 
      this.workflowRules.areApprovalGatesSatisfied(
        project.currentDepartment,
        currentStatus,
        approvals.map(a => ({ approvalType: a.approvalType, status: a.status })),
        qaRounds.map(qa => ({ status: qa.status }))
      ) : { satisfied: true, missingRequirements: [] };

    return {
      currentDepartment: project.currentDepartment,
      currentStatus,
      allowedNextDepartments: allowedDepartments,
      workflowSequence,
      approvalGate: {
        required: !!approvalGate,
        satisfied: gateStatus.satisfied,
        missingRequirements: gateStatus.missingRequirements,
      },
      canProceed: gateStatus.satisfied && allowedDepartments.length > 0,
    };
  }

  async requestManagerReview(projectId: string, reason: string, user: User) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        departmentHistory: {
          include: {
            qaRounds: {
              include: { bugs: true }
            }
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if manager review is required
    const totalRejections = project.departmentHistory.filter(
      h => h.workStatus === DepartmentWorkStatus.QA_REJECTED || 
           h.workStatus === DepartmentWorkStatus.CLIENT_REJECTED
    ).length;

    const totalCriticalBugs = project.departmentHistory
      .flatMap(h => h.qaRounds)
      .reduce((sum, qa) => sum + qa.criticalBugs, 0);

    if (!this.workflowRules.requiresManagerReview(totalRejections, totalCriticalBugs)) {
      throw new BadRequestException('Manager review not required for this project');
    }

    // Find current department history
    const currentHistory = await this.prisma.projectDepartmentHistory.findFirst({
      where: { 
        projectId: projectId,
        toDepartment: project.currentDepartment 
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!currentHistory) {
      throw new NotFoundException('Current department history not found');
    }

    // Create manager approval request
    return this.prisma.workflowApproval.create({
      data: {
        historyId: currentHistory.id,
        approvalType: ApprovalType.MANAGER_REVIEW,
        requestedById: user.id,
        comments: `Manager review requested: ${reason}`,
      },
      include: {
        requestedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async submitManagerReview(approvalId: string, decision: 'PROCEED' | 'REVISE' | 'CANCEL', comments: string, user: User) {
    // Only managers can submit manager reviews
    if (user.role !== Role.PROJECT_MANAGER && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only managers can submit manager reviews');
    }

    const approval = await this.prisma.workflowApproval.findUnique({
      where: { id: approvalId },
      include: { 
        departmentHistory: { 
          include: { project: true } 
        } 
      },
    });

    if (!approval) {
      throw new NotFoundException('Manager review not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update the approval
      await tx.workflowApproval.update({
        where: { id: approvalId },
        data: {
          status: decision === 'PROCEED' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
          reviewedById: user.id,
          reviewedAt: new Date(),
          comments,
          rejectionReason: decision === 'CANCEL' ? 'Project cancelled by management' : undefined,
        },
      });

      // Update project status based on decision
      let newStatus: ProjectStatus;
      let newWorkStatus: DepartmentWorkStatus;

      switch (decision) {
        case 'PROCEED':
          newStatus = ProjectStatus.ACTIVE;
          newWorkStatus = DepartmentWorkStatus.READY_FOR_DELIVERY;
          break;
        case 'REVISE':
          newStatus = ProjectStatus.ACTIVE;
          newWorkStatus = DepartmentWorkStatus.CORRECTIONS_NEEDED;
          break;
        case 'CANCEL':
          newStatus = ProjectStatus.CANCELLED;
          newWorkStatus = approval.departmentHistory.workStatus;
          break;
      }

      // Update project
      const updatedProject = await tx.project.update({
        where: { id: approval.departmentHistory.projectId },
        data: { status: newStatus },
      });

      // Update department history
      await tx.projectDepartmentHistory.update({
        where: { id: approval.historyId },
        data: { workStatus: newWorkStatus },
      });

      return updatedProject;
    });
  }

  async reassignPCOrTL(projectId: string, reassignDto: { assignmentType: 'PROJECT_COORDINATOR' | 'PC_TEAM_LEAD'; newUserId: string; reason?: string; notes?: string }, user: User) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectCoordinator: true,
        pcTeamLead: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check permissions - only PMO department, Admin, or Project Manager can reassign
    const userDepartment = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { departmentMaster: true }
    });
    
    const isPMOUser = userDepartment?.departmentMaster?.code === 'PMO';
    
    if (user.role !== Role.ADMIN && user.role !== Role.PROJECT_MANAGER && !isPMOUser) {
      throw new ForbiddenException('You do not have permission to reassign project coordinators');
    }

    const assignmentType = reassignDto.assignmentType === 'PROJECT_COORDINATOR' 
      ? ProjectAssignmentType.PROJECT_COORDINATOR 
      : ProjectAssignmentType.PC_TEAM_LEAD;

    const currentUserId = reassignDto.assignmentType === 'PROJECT_COORDINATOR' 
      ? project.projectCoordinatorId 
      : project.pcTeamLeadId;

    // Verify the new user has the correct role
    const newUser = await this.prisma.user.findUnique({ 
      where: { id: reassignDto.newUserId },
      include: { roleMaster: true, departmentMaster: true }
    });
    if (!newUser) {
      throw new NotFoundException('User not found');
    }

    // Check if user is in PMO department
    if (newUser.departmentMaster?.code !== 'PMO') {
      throw new BadRequestException('User must be in PMO department');
    }

    if (reassignDto.assignmentType === 'PROJECT_COORDINATOR') {
      if (newUser.roleMaster?.code !== 'PC') {
        throw new BadRequestException('User must have PC role for this assignment');
      }
    } else {
      if (!['PC_TL1', 'PC_TL2'].includes(newUser.roleMaster?.code || '')) {
        throw new BadRequestException('User must have PC_TL1 or PC_TL2 role for this assignment');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Create assignment history record
      await tx.projectAssignmentHistory.create({
        data: {
          projectId,
          assignmentType,
          previousUserId: currentUserId,
          newUserId: reassignDto.newUserId,
          assignedById: user.id,
          reason: reassignDto.reason || 'Manual reassignment',
          notes: reassignDto.notes,
        },
      });

      // Update project with new assignment
      const updateData: any = {};
      if (reassignDto.assignmentType === 'PROJECT_COORDINATOR') {
        updateData.projectCoordinatorId = reassignDto.newUserId;
      } else {
        updateData.pcTeamLeadId = reassignDto.newUserId;
      }

      return tx.project.update({
        where: { id: projectId },
        data: updateData,
        include: {
          owner: {
            select: { id: true, name: true, email: true, role: true },
          },
          projectCoordinator: {
            select: { id: true, name: true, email: true, role: true },
          },
          pcTeamLead: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });
    });
  }

  async getAssignmentHistory(projectId: string, user: User) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check access permissions
    if (user.role === Role.CLIENT && project.ownerId !== user.id) {
      throw new ForbiddenException('Access denied to this project');
    }

    return this.prisma.projectAssignmentHistory.findMany({
      where: { projectId },
      include: {
        previousUser: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });
  }
}