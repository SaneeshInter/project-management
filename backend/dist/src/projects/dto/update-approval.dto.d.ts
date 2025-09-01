import { ApprovalStatus } from '@prisma/client';
export declare class UpdateApprovalDto {
    status: ApprovalStatus;
    comments?: string;
    rejectionReason?: string;
}
