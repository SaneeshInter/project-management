import { CorrectionStatus } from '@prisma/client';
export declare class UpdateCorrectionDto {
    status?: CorrectionStatus;
    assignedToId?: string;
    resolutionNotes?: string;
    actualHours?: number;
}
