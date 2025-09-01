import { ApprovalType } from '@prisma/client';
export declare class CreateApprovalDto {
    approvalType: ApprovalType;
    comments?: string;
    attachments?: string[];
}
