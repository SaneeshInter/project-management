import { ChecklistTemplatesService } from './checklist-templates.service';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';
import { ReorderChecklistTemplatesDto } from './dto/reorder-checklist-templates.dto';
export declare class ChecklistTemplatesController {
    private readonly checklistTemplatesService;
    constructor(checklistTemplatesService: ChecklistTemplatesService);
    create(createChecklistTemplateDto: CreateChecklistTemplateDto): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        order: number;
        title: string;
        isRequired: boolean;
    }>;
    findByDepartment(department: string): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        order: number;
        title: string;
        isRequired: boolean;
    }[]>;
    update(id: string, updateChecklistTemplateDto: UpdateChecklistTemplateDto): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        order: number;
        title: string;
        isRequired: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        order: number;
        title: string;
        isRequired: boolean;
    }>;
    reorder(department: string, reorderDto: ReorderChecklistTemplatesDto): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        order: number;
        title: string;
        isRequired: boolean;
    }[]>;
}
