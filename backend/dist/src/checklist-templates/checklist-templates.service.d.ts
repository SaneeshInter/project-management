import { PrismaService } from '../database/prisma.service';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';
export declare class ChecklistTemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: string): Promise<{
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
    reorder(department: string, itemIds: string[]): Promise<{
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
    seedDefaultTemplates(): Promise<void>;
}
