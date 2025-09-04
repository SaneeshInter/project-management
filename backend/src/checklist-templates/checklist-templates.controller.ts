import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChecklistTemplatesService } from './checklist-templates.service';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';
import { ReorderChecklistTemplatesDto } from './dto/reorder-checklist-templates.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Checklist Templates')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('checklist/templates')
export class ChecklistTemplatesController {
  constructor(private readonly checklistTemplatesService: ChecklistTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new checklist template' })
  @ApiResponse({ status: 201, description: 'Checklist template created successfully' })
  create(@Body() createChecklistTemplateDto: CreateChecklistTemplateDto) {
    return this.checklistTemplatesService.create(createChecklistTemplateDto);
  }

  @Get(':department')
  @ApiOperation({ summary: 'Get checklist templates by department' })
  @ApiResponse({ status: 200, description: 'Checklist templates retrieved successfully' })
  findByDepartment(@Param('department') department: string) {
    return this.checklistTemplatesService.findByDepartment(department);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a checklist template' })
  @ApiResponse({ status: 200, description: 'Checklist template updated successfully' })
  update(@Param('id') id: string, @Body() updateChecklistTemplateDto: UpdateChecklistTemplateDto) {
    return this.checklistTemplatesService.update(id, updateChecklistTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a checklist template' })
  @ApiResponse({ status: 200, description: 'Checklist template deleted successfully' })
  remove(@Param('id') id: string) {
    return this.checklistTemplatesService.remove(id);
  }

  @Patch(':department/reorder')
  @ApiOperation({ summary: 'Reorder checklist templates for a department' })
  @ApiResponse({ status: 200, description: 'Checklist templates reordered successfully' })
  reorder(
    @Param('department') department: string, 
    @Body() reorderDto: ReorderChecklistTemplatesDto
  ) {
    return this.checklistTemplatesService.reorder(department, reorderDto.itemIds);
  }
}