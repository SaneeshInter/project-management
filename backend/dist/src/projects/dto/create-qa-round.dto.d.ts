import { QAType } from '@prisma/client';
export declare class CreateQATestingRoundDto {
    qaType: QAType;
    testedById: string;
    testResults?: string;
}
