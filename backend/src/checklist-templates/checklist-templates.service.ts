import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';

@Injectable()
export class ChecklistTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(createChecklistTemplateDto: CreateChecklistTemplateDto) {
    return this.prisma.checklistTemplate.create({
      data: createChecklistTemplateDto,
    });
  }

  async findByDepartment(department: string) {
    return this.prisma.checklistTemplate.findMany({
      where: {
        department,
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.checklistTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Checklist template with ID ${id} not found`);
    }

    return template;
  }

  async update(id: string, updateChecklistTemplateDto: UpdateChecklistTemplateDto) {
    await this.findOne(id); // Ensure template exists
    
    return this.prisma.checklistTemplate.update({
      where: { id },
      data: updateChecklistTemplateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure template exists
    
    return this.prisma.checklistTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async reorder(department: string, itemIds: string[]) {
    const templates = await this.prisma.checklistTemplate.findMany({
      where: {
        department,
        id: { in: itemIds },
        isActive: true,
      },
    });

    if (templates.length !== itemIds.length) {
      throw new NotFoundException('Some checklist templates not found');
    }

    // Update order for each template
    const updatePromises = itemIds.map((itemId, index) =>
      this.prisma.checklistTemplate.update({
        where: { id: itemId },
        data: { order: index },
      })
    );

    await Promise.all(updatePromises);
    
    return this.findByDepartment(department);
  }

  async seedDefaultTemplates() {
    // Check if templates already exist
    const existingCount = await this.prisma.checklistTemplate.count();
    if (existingCount > 0) {
      return;
    }

    const defaultTemplates = [
      // PMO Department
      { department: 'PMO', title: 'Client requirements documented and approved', description: 'All client requirements have been documented in detail and formally approved', isRequired: true, order: 0 },
      { department: 'PMO', title: 'Project scope clearly defined', description: 'Project scope, deliverables, and boundaries are well-defined', isRequired: true, order: 1 },
      { department: 'PMO', title: 'Timeline and milestones established', description: 'Project timeline with clear milestones has been created and approved', isRequired: true, order: 2 },
      
      // DESIGN Department  
      { department: 'DESIGN', title: 'Design brief received from PMO', description: 'Complete design brief with requirements received from PMO team', isRequired: true, order: 0 },
      { department: 'DESIGN', title: 'Wireframes completed', description: 'All wireframes for the project have been created and reviewed', isRequired: true, order: 1 },
      { department: 'DESIGN', title: 'Design mockups created', description: 'High-fidelity design mockups completed for all pages/screens', isRequired: true, order: 2 },
      
      // HTML Department
      { department: 'HTML', title: 'Design files received from DESIGN', description: 'All approved design files and assets received from design team', isRequired: true, order: 0 },
      { department: 'HTML', title: 'HTML structure completed', description: 'Complete HTML structure implemented according to designs', isRequired: true, order: 1 },
      { department: 'HTML', title: 'CSS styling implemented', description: 'All CSS styling completed to match approved designs', isRequired: true, order: 2 },
      
      // QA Department
      { department: 'QA', title: 'Test plan created', description: 'Comprehensive test plan covering all functionality', isRequired: true, order: 0 },
      { department: 'QA', title: 'Functional testing completed', description: 'All features tested according to requirements', isRequired: true, order: 1 },
      { department: 'QA', title: 'Final QA approval', description: 'QA team lead approval for release', isRequired: true, order: 2 },
    ];

    await this.prisma.checklistTemplate.createMany({
      data: defaultTemplates,
    });
  }
}