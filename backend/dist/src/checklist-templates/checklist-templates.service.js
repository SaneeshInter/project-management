"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let ChecklistTemplatesService = class ChecklistTemplatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createChecklistTemplateDto) {
        return this.prisma.checklistTemplate.create({
            data: createChecklistTemplateDto,
        });
    }
    async findByDepartment(department) {
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
    async findOne(id) {
        const template = await this.prisma.checklistTemplate.findUnique({
            where: { id },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Checklist template with ID ${id} not found`);
        }
        return template;
    }
    async update(id, updateChecklistTemplateDto) {
        await this.findOne(id);
        return this.prisma.checklistTemplate.update({
            where: { id },
            data: updateChecklistTemplateDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.checklistTemplate.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async reorder(department, itemIds) {
        const templates = await this.prisma.checklistTemplate.findMany({
            where: {
                department,
                id: { in: itemIds },
                isActive: true,
            },
        });
        if (templates.length !== itemIds.length) {
            throw new common_1.NotFoundException('Some checklist templates not found');
        }
        const updatePromises = itemIds.map((itemId, index) => this.prisma.checklistTemplate.update({
            where: { id: itemId },
            data: { order: index },
        }));
        await Promise.all(updatePromises);
        return this.findByDepartment(department);
    }
    async seedDefaultTemplates() {
        const existingCount = await this.prisma.checklistTemplate.count();
        if (existingCount > 0) {
            return;
        }
        const defaultTemplates = [
            { department: 'PMO', title: 'Client requirements documented and approved', description: 'All client requirements have been documented in detail and formally approved', isRequired: true, order: 0 },
            { department: 'PMO', title: 'Project scope clearly defined', description: 'Project scope, deliverables, and boundaries are well-defined', isRequired: true, order: 1 },
            { department: 'PMO', title: 'Timeline and milestones established', description: 'Project timeline with clear milestones has been created and approved', isRequired: true, order: 2 },
            { department: 'DESIGN', title: 'Design brief received from PMO', description: 'Complete design brief with requirements received from PMO team', isRequired: true, order: 0 },
            { department: 'DESIGN', title: 'Wireframes completed', description: 'All wireframes for the project have been created and reviewed', isRequired: true, order: 1 },
            { department: 'DESIGN', title: 'Design mockups created', description: 'High-fidelity design mockups completed for all pages/screens', isRequired: true, order: 2 },
            { department: 'HTML', title: 'Design files received from DESIGN', description: 'All approved design files and assets received from design team', isRequired: true, order: 0 },
            { department: 'HTML', title: 'HTML structure completed', description: 'Complete HTML structure implemented according to designs', isRequired: true, order: 1 },
            { department: 'HTML', title: 'CSS styling implemented', description: 'All CSS styling completed to match approved designs', isRequired: true, order: 2 },
            { department: 'QA', title: 'Test plan created', description: 'Comprehensive test plan covering all functionality', isRequired: true, order: 0 },
            { department: 'QA', title: 'Functional testing completed', description: 'All features tested according to requirements', isRequired: true, order: 1 },
            { department: 'QA', title: 'Final QA approval', description: 'QA team lead approval for release', isRequired: true, order: 2 },
        ];
        await this.prisma.checklistTemplate.createMany({
            data: defaultTemplates,
        });
    }
};
exports.ChecklistTemplatesService = ChecklistTemplatesService;
exports.ChecklistTemplatesService = ChecklistTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChecklistTemplatesService);
//# sourceMappingURL=checklist-templates.service.js.map