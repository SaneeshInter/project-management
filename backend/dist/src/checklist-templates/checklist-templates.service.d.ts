import { PrismaService } from '../database/prisma.service';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';
export declare class ChecklistTemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: string): Promise<{
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
    reorder(department: string, itemIds: string[]): Promise<{
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
    seedDefaultTemplates(): Promise<void>;
}
