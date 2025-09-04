import { ChecklistTemplatesService } from './checklist-templates.service';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';
import { ReorderChecklistTemplatesDto } from './dto/reorder-checklist-templates.dto';
export declare class ChecklistTemplatesController {
    private readonly checklistTemplatesService;
    constructor(checklistTemplatesService: ChecklistTemplatesService);
    create(createChecklistTemplateDto: CreateChecklistTemplateDto): Promise<{
        description: string | null;
        title: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        order: number;
        isRequired: boolean;
    }>;
    findByDepartment(department: string): Promise<{
        description: string | null;
        title: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        order: number;
        isRequired: boolean;
    }[]>;
    update(id: string, updateChecklistTemplateDto: UpdateChecklistTemplateDto): Promise<{
        description: string | null;
        title: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        order: number;
        isRequired: boolean;
    }>;
    remove(id: string): Promise<{
        description: string | null;
        title: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        order: number;
        isRequired: boolean;
    }>;
    reorder(department: string, reorderDto: ReorderChecklistTemplatesDto): Promise<{
        description: string | null;
        title: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        department: string;
        order: number;
        isRequired: boolean;
    }[]>;
}
