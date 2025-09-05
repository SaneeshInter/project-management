import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddCustomFieldDto } from './dto/add-custom-field.dto';
import { CreateDepartmentTransitionDto } from './dto/create-department-transition.dto';
import { UpdateDepartmentWorkStatusDto } from './dto/update-department-work-status.dto';
import { UpdateChecklistItemDto, CreateChecklistItemLinkDto, CreateChecklistItemUpdateDto } from './dto/update-checklist-item.dto';
import { DisableProjectDto } from './dto/disable-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
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
    return this.projectsService.findAll(user.id, user.role, user);
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


  // Department Checklist Endpoints
  @Get(':id/checklist')
  @ApiOperation({ summary: 'Get checklist progress for a project department' })
  @ApiQuery({ name: 'department', required: false })
  @ApiResponse({ status: 200, description: 'Checklist progress retrieved successfully' })
  getChecklistProgress(
    @Param('id') projectId: string, 
    @Query('department') department: string,
    @User() user: UserEntity
  ) {
    return this.projectsService.getChecklistProgress(projectId, department, user);
  }

  @Patch(':id/checklist/:itemId')
  @ApiOperation({ summary: 'Update checklist item' })
  @ApiResponse({ status: 200, description: 'Checklist item updated successfully' })
  updateChecklistItem(
    @Param('id') projectId: string,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateChecklistItemDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.updateChecklistItem(projectId, itemId, updateDto, user);
  }

  @Post(':id/checklist/:itemId/links')
  @ApiOperation({ summary: 'Add link to checklist item' })
  @ApiResponse({ status: 201, description: 'Link added successfully' })
  addChecklistItemLink(
    @Param('id') projectId: string,
    @Param('itemId') itemId: string,
    @Body() linkDto: CreateChecklistItemLinkDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.addChecklistItemLink(projectId, itemId, linkDto, user);
  }

  @Delete(':id/checklist/:itemId/links/:linkId')
  @ApiOperation({ summary: 'Remove link from checklist item' })
  @ApiResponse({ status: 200, description: 'Link removed successfully' })
  removeChecklistItemLink(
    @Param('id') projectId: string,
    @Param('itemId') itemId: string,
    @Param('linkId') linkId: string,
    @User() user: UserEntity,
  ) {
    return this.projectsService.removeChecklistItemLink(projectId, itemId, linkId, user);
  }

  @Post(':id/checklist/:itemId/updates')
  @ApiOperation({ summary: 'Add update history to checklist item' })
  @ApiResponse({ status: 201, description: 'Update history added successfully' })
  addChecklistItemUpdate(
    @Param('id') projectId: string,
    @Param('itemId') itemId: string,
    @Body() updateDto: CreateChecklistItemUpdateDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.addChecklistItemUpdate(projectId, itemId, updateDto, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update project status' })
  @ApiResponse({ status: 200, description: 'Project status updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  updateProjectStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateProjectStatusDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.updateProjectStatus(id, updateStatusDto, user);
  }

  @Patch(':id/disable')
  @ApiOperation({ summary: 'Disable or enable project (soft delete)' })
  @ApiResponse({ status: 200, description: 'Project disabled/enabled successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  disableProject(
    @Param('id') id: string,
    @Body() disableDto: DisableProjectDto,
    @User() user: UserEntity,
  ) {
    return this.projectsService.disableProject(id, disableDto, user);
  }
}