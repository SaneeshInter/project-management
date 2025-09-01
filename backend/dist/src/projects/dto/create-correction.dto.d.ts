import { Priority } from '@prisma/client';
export declare class CreateCorrectionDto {
    correctionType: string;
    description: string;
    assignedToId?: string;
    priority?: Priority;
    estimatedHours?: number;
}
