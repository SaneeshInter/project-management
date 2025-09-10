import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCategoryMasterDto } from './dto/create-category.dto';
import { UpdateCategoryMasterDto } from './dto/update-category.dto';
import { CreateCategoryDepartmentMappingDto } from './dto/create-category-department-mapping.dto';
import { UpdateCategoryDepartmentMappingDto } from './dto/update-category-department-mapping.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Category Master CRUD
  async createCategory(createCategoryDto: CreateCategoryMasterDto) {
    try {
      return await this.prisma.categoryMaster.create({
        data: createCategoryDto,
        include: {
          departmentMappings: {
            where: { isActive: true },
            orderBy: { sequence: 'asc' },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category with this name or code already exists');
      }
      throw error;
    }
  }

  async findAllCategories(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    
    return this.prisma.categoryMaster.findMany({
      where,
      include: {
        departmentMappings: {
          where: { isActive: true },
          orderBy: { sequence: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findCategoryById(id: string) {
    const category = await this.prisma.categoryMaster.findUnique({
      where: { id },
      include: {
        departmentMappings: {
          where: { isActive: true },
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryMasterDto) {
    try {
      return await this.prisma.categoryMaster.update({
        where: { id },
        data: updateCategoryDto,
        include: {
          departmentMappings: {
            where: { isActive: true },
            orderBy: { sequence: 'asc' },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Category with this name or code already exists');
      }
      throw error;
    }
  }

  async deleteCategory(id: string) {
    try {
      // Check if category is being used by any projects
      const projectsCount = await this.prisma.project.count({
        where: { categoryMasterId: id },
      });

      if (projectsCount > 0) {
        throw new ConflictException(
          `Cannot delete category. It is being used by ${projectsCount} project(s)`
        );
      }

      await this.prisma.categoryMaster.delete({ where: { id } });
      return { message: 'Category deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      throw error;
    }
  }

  // Department Mapping CRUD
  async createDepartmentMapping(createMappingDto: CreateCategoryDepartmentMappingDto) {
    try {
      // Verify category exists
      await this.findCategoryById(createMappingDto.categoryId);

      return await this.prisma.categoryDepartmentMapping.create({
        data: createMappingDto,
        include: {
          category: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Department mapping already exists for this category and department or sequence'
        );
      }
      throw error;
    }
  }

  async findDepartmentMappings(categoryId: string) {
    return this.prisma.categoryDepartmentMapping.findMany({
      where: { 
        categoryId,
        isActive: true 
      },
      orderBy: { sequence: 'asc' },
      include: {
        category: true,
      },
    });
  }

  async updateDepartmentMapping(
    id: string,
    updateMappingDto: UpdateCategoryDepartmentMappingDto
  ) {
    try {
      return await this.prisma.categoryDepartmentMapping.update({
        where: { id },
        data: updateMappingDto,
        include: {
          category: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Department mapping with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Department mapping already exists for this category and department or sequence'
        );
      }
      throw error;
    }
  }

  async deleteDepartmentMapping(id: string) {
    try {
      await this.prisma.categoryDepartmentMapping.delete({ where: { id } });
      return { message: 'Department mapping deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Department mapping with ID ${id} not found`);
      }
      throw error;
    }
  }

  // Workflow related methods
  async getCategoryWorkflow(categoryId: string) {
    const category = await this.findCategoryById(categoryId);
    
    const mappings = await this.findDepartmentMappings(categoryId);
    
    return {
      category: {
        id: category.id,
        name: category.name,
        code: category.code,
        defaultStartDept: category.defaultStartDept,
        estimatedTotalHours: category.estimatedTotalHours,
      },
      departments: mappings.map(mapping => ({
        department: mapping.department,
        sequence: mapping.sequence,
        isRequired: mapping.isRequired,
        estimatedHours: mapping.estimatedHours,
        estimatedDays: mapping.estimatedDays,
      })),
    };
  }

  async getNextDepartment(categoryId: string, currentDepartment: string) {
    const mappings = await this.findDepartmentMappings(categoryId);
    
    const currentMapping = mappings.find(m => m.department === currentDepartment);
    if (!currentMapping) {
      return null;
    }

    const nextMapping = mappings.find(m => m.sequence === currentMapping.sequence + 1);
    return nextMapping ? nextMapping.department : null;
  }

  async bulkCreateDepartmentMappings(categoryId: string, departments: any[]) {
    // Verify category exists
    await this.findCategoryById(categoryId);

    // Delete existing mappings for this category
    await this.prisma.categoryDepartmentMapping.deleteMany({
      where: { categoryId },
    });

    // Create new mappings
    const createData = departments.map(dept => ({
      categoryId,
      department: dept.department,
      sequence: dept.sequence,
      isRequired: dept.isRequired || true,
      estimatedHours: dept.estimatedHours,
      estimatedDays: dept.estimatedDays,
    }));

    await this.prisma.categoryDepartmentMapping.createMany({
      data: createData,
    });

    return this.findDepartmentMappings(categoryId);
  }
}