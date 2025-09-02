import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddCustomFieldDto } from './dto/add-custom-field.dto';
import { CreateDepartmentTransitionDto } from './dto/create-department-transition.dto';
import { UpdateDepartmentWorkStatusDto } from './dto/update-department-work-status.dto';
import { CreateCorrectionDto } from './dto/create-correction.dto';
import { UpdateCorrectionDto } from './dto/update-correction.dto';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { CreateQATestingRoundDto } from './dto/create-qa-round.dto';
import { CreateQABugDto } from './dto/create-qa-bug.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { User as UserEntity } from '@prisma/client';

@ApiTags('Projects')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  create(@Body() createProjectDto: CreateProjectDto, @User() user: UserEntity) {
    return this.projectsService.create(createProjectDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findAll(@User() user: UserEntity) {
    return this.projectsService.findAll(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string, @User() user: UserEntity) {
    return this.projectsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @User() user: UserEntity) {
    return this.projectsService.update(id, updateProjectDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  remove(@Param('id') id: string, @User() user: UserEntity) {
    return this.projectsService.remove(id, user);
  }

  @Post(':id/custom-fields')
  @ApiOperation({ summary: 'Add custom field to project' })
  @ApiResponse({ status: 201, description: 'Custom field added successfully' })
  addCustomField(
    @Param('id') id: string,
    @Body() addCustomFieldDto: AddCustomFieldDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.addCustomField(
      id, 
      addCustomFieldDto.fieldName, 
      addCustomFieldDto.fieldValue, 
      user
    );
  }

  @Post(':id/move-to-department')
  @ApiOperation({ summary: 'Move project to different department' })
  @ApiResponse({ status: 200, description: 'Project moved to new department successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  moveToDepartment(
    @Param('id') id: string,
    @Body() transitionDto: CreateDepartmentTransitionDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.moveToDepartment(id, transitionDto, user);
  }

  @Get(':id/department-history')
  @ApiOperation({ summary: 'Get project department history' })
  @ApiResponse({ status: 200, description: 'Department history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getDepartmentHistory(@Param('id') id: string, @User() user: UserEntity) {
    return this.projectsService.getDepartmentHistory(id, user);
  }

  @Patch(':id/department-status')
  @ApiOperation({ summary: 'Update department work status' })
  @ApiResponse({ status: 200, description: 'Department work status updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  updateDepartmentWorkStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateDepartmentWorkStatusDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.updateDepartmentWorkStatus(id, statusDto, user);
  }

  @Post(':id/departments/:historyId/corrections')
  @ApiOperation({ summary: 'Create correction for department work' })
  @ApiResponse({ status: 201, description: 'Correction created successfully' })
  @ApiResponse({ status: 404, description: 'Project or department history not found' })
  createCorrection(
    @Param('id') projectId: string,
    @Param('historyId') historyId: string,
    @Body() correctionDto: CreateCorrectionDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.createCorrection(projectId, historyId, correctionDto, user);
  }

  @Get(':id/corrections')
  @ApiOperation({ summary: 'Get all corrections for project' })
  @ApiResponse({ status: 200, description: 'Corrections retrieved successfully' })
  getProjectCorrections(@Param('id') id: string, @User() user: UserEntity) {
    return this.projectsService.getProjectCorrections(id, user);
  }

  @Patch(':id/corrections/:correctionId')
  @ApiOperation({ summary: 'Update correction status' })
  @ApiResponse({ status: 200, description: 'Correction updated successfully' })
  updateCorrection(
    @Param('id') projectId: string,
    @Param('correctionId') correctionId: string,
    @Body() updateDto: UpdateCorrectionDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.updateCorrection(projectId, correctionId, updateDto, user);
  }

  @Get(':id/timeline-analytics')
  @ApiOperation({ summary: 'Get project timeline analytics' })
  @ApiResponse({ status: 200, description: 'Timeline analytics retrieved successfully' })
  getTimelineAnalytics(@Param('id') id: string, @User() user: UserEntity) {
    return this.projectsService.getTimelineAnalytics(id, user);
  }

  // Enhanced Workflow Endpoints
  @Post(':id/departments/:historyId/request-approval')
  @ApiOperation({ summary: 'Request approval for a department stage' })
  @ApiResponse({ status: 201, description: 'Approval request created successfully' })
  requestApproval(
    @Param('id') projectId: string,
    @Param('historyId') historyId: string,
    @Body() approvalDto: CreateApprovalDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.requestApproval(projectId, historyId, approvalDto.approvalType, user);
  }

  @Patch(':id/approvals/:approvalId')
  @ApiOperation({ summary: 'Submit approval decision (approve/reject)' })
  @ApiResponse({ status: 200, description: 'Approval decision submitted successfully' })
  submitApproval(
    @Param('id') projectId: string,
    @Param('approvalId') approvalId: string,
    @Body() updateDto: UpdateApprovalDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.submitApproval(
      approvalId, 
      updateDto.status, 
      updateDto.comments, 
      updateDto.rejectionReason, 
      user
    );
  }

  @Post(':id/departments/:historyId/start-qa')
  @ApiOperation({ summary: 'Start QA testing round for a department stage' })
  @ApiResponse({ status: 201, description: 'QA testing round started successfully' })
  startQATesting(
    @Param('id') projectId: string,
    @Param('historyId') historyId: string,
    @Body() qaDto: CreateQATestingRoundDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.startQATesting(projectId, historyId, qaDto.qaType, qaDto.testedById, user);
  }

  @Patch(':id/qa-rounds/:qaRoundId/complete')
  @ApiOperation({ summary: 'Complete QA testing round with results' })
  @ApiResponse({ status: 200, description: 'QA testing round completed successfully' })
  completeQATesting(
    @Param('id') projectId: string,
    @Param('qaRoundId') qaRoundId: string,
    @Body() completeDto: any,
    @User() user: UserEntity,
  ) {
    return this.projectsService.completeQATestingRound(
      qaRoundId,
      completeDto.status,
      completeDto.bugsFound,
      completeDto.criticalBugs,
      completeDto.testResults,
      completeDto.rejectionReason
    );
  }

  @Post(':id/qa-rounds/:qaRoundId/bugs')
  @ApiOperation({ summary: 'Create a bug report in QA testing round' })
  @ApiResponse({ status: 201, description: 'Bug report created successfully' })
  createQABug(
    @Param('id') projectId: string,
    @Param('qaRoundId') qaRoundId: string,
    @Body() bugDto: CreateQABugDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.createQABug(qaRoundId, bugDto, user);
  }

  @Get(':id/workflow-status')
  @ApiOperation({ summary: 'Get comprehensive workflow status with approvals and QA rounds' })
  @ApiResponse({ status: 200, description: 'Workflow status retrieved successfully' })
  getWorkflowStatus(@Param('id') id: string, @User() user: UserEntity) {
    return this.projectsService.getWorkflowStatus(id);
  }

  @Get(':id/allowed-departments')
  @ApiOperation({ summary: 'Get allowed next departments based on workflow rules' })
  @ApiResponse({ status: 200, description: 'Allowed departments retrieved successfully' })
  getAllowedNextDepartments(@Param('id') id: string, @User() user: UserEntity) {
    return this.projectsService.getAllowedNextDepartments(id, user);
  }

  @Get(':id/workflow-validation')
  @ApiOperation({ summary: 'Get workflow validation status for frontend enforcement' })
  @ApiResponse({ status: 200, description: 'Workflow validation status retrieved successfully' })
  getWorkflowValidationStatus(@Param('id') id: string, @User() user: UserEntity) {
    return this.projectsService.getWorkflowValidationStatus(id, user);
  }

  @Post(':id/manager-review')
  @ApiOperation({ summary: 'Request manager review for rejected project' })
  @ApiResponse({ status: 201, description: 'Manager review requested successfully' })
  requestManagerReview(
    @Param('id') projectId: string,
    @Body() reviewData: { reason: string },
    @User() user: UserEntity,
  ) {
    return this.projectsService.requestManagerReview(projectId, reviewData.reason, user);
  }

  @Patch('manager-review/:approvalId')
  @ApiOperation({ summary: 'Submit manager review decision' })
  @ApiResponse({ status: 200, description: 'Manager review submitted successfully' })
  submitManagerReview(
    @Param('approvalId') approvalId: string,
    @Body() reviewDecision: { decision: 'PROCEED' | 'REVISE' | 'CANCEL'; comments: string },
    @User() user: UserEntity,
  ) {
    return this.projectsService.submitManagerReview(
      approvalId, 
      reviewDecision.decision, 
      reviewDecision.comments, 
      user
    );
  }
}