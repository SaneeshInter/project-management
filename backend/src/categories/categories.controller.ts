import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryMasterDto } from './dto/create-category.dto';
import { UpdateCategoryMasterDto } from './dto/update-category.dto';
import { CreateCategoryDepartmentMappingDto } from './dto/create-category-department-mapping.dto';
import { UpdateCategoryDepartmentMappingDto } from './dto/update-category-department-mapping.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Categories')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Category Master endpoints
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SU_ADMIN)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  createCategory(@Body() createCategoryDto: CreateCategoryMasterDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  findAllCategories(@Query('includeInactive') includeInactive?: string) {
    const includeInactiveFlag = includeInactive === 'true';
    return this.categoriesService.findAllCategories(includeInactiveFlag);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findCategoryById(@Param('id') id: string) {
    return this.categoriesService.findCategoryById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SU_ADMIN)
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryMasterDto
  ) {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SU_ADMIN)
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  deleteCategory(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }

  // Department Mapping endpoints
  @Post(':categoryId/departments')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SU_ADMIN)
  @ApiOperation({ summary: 'Add department mapping to category' })
  @ApiResponse({ status: 201, description: 'Department mapping created successfully' })
  createDepartmentMapping(
    @Param('categoryId') categoryId: string,
    @Body() createMappingDto: CreateCategoryDepartmentMappingDto
  ) {
    // Override categoryId from URL param
    createMappingDto.categoryId = categoryId;
    return this.categoriesService.createDepartmentMapping(createMappingDto);
  }

  @Get(':categoryId/departments')
  @ApiOperation({ summary: 'Get department mappings for category' })
  @ApiResponse({ status: 200, description: 'Department mappings retrieved successfully' })
  findDepartmentMappings(@Param('categoryId') categoryId: string) {
    return this.categoriesService.findDepartmentMappings(categoryId);
  }

  @Patch('departments/:mappingId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SU_ADMIN)
  @ApiOperation({ summary: 'Update department mapping' })
  @ApiResponse({ status: 200, description: 'Department mapping updated successfully' })
  @ApiResponse({ status: 404, description: 'Department mapping not found' })
  updateDepartmentMapping(
    @Param('mappingId') mappingId: string,
    @Body() updateMappingDto: UpdateCategoryDepartmentMappingDto
  ) {
    return this.categoriesService.updateDepartmentMapping(mappingId, updateMappingDto);
  }

  @Delete('departments/:mappingId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SU_ADMIN)
  @ApiOperation({ summary: 'Delete department mapping' })
  @ApiResponse({ status: 200, description: 'Department mapping deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department mapping not found' })
  deleteDepartmentMapping(@Param('mappingId') mappingId: string) {
    return this.categoriesService.deleteDepartmentMapping(mappingId);
  }

  // Workflow endpoints
  @Get(':categoryId/workflow')
  @ApiOperation({ summary: 'Get category workflow (department sequence)' })
  @ApiResponse({ status: 200, description: 'Category workflow retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  getCategoryWorkflow(@Param('categoryId') categoryId: string) {
    return this.categoriesService.getCategoryWorkflow(categoryId);
  }

  @Get(':categoryId/next-department')
  @ApiOperation({ summary: 'Get next department in workflow' })
  @ApiQuery({ name: 'currentDept', required: true, description: 'Current department' })
  @ApiResponse({ status: 200, description: 'Next department retrieved successfully' })
  getNextDepartment(
    @Param('categoryId') categoryId: string,
    @Query('currentDept') currentDept: string
  ) {
    return this.categoriesService.getNextDepartment(categoryId, currentDept);
  }

  @Post(':categoryId/departments/bulk')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SU_ADMIN)
  @ApiOperation({ summary: 'Bulk create/update department mappings' })
  @ApiResponse({ status: 201, description: 'Department mappings created successfully' })
  bulkCreateDepartmentMappings(
    @Param('categoryId') categoryId: string,
    @Body() departments: any[]
  ) {
    return this.categoriesService.bulkCreateDepartmentMappings(categoryId, departments);
  }
}