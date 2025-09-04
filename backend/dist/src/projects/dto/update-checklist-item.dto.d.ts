export declare class ChecklistItemLinkDto {
    url: string;
    title: string;
    type: 'document' | 'link' | 'reference';
}
export declare class UpdateChecklistItemDto {
    isCompleted: boolean;
    completedDate?: string;
    notes?: string;
    links?: ChecklistItemLinkDto[];
}
export declare class CreateChecklistItemLinkDto {
    url: string;
    title: string;
    type: 'document' | 'link' | 'reference';
}
export declare class CreateChecklistItemUpdateDto {
    date: string;
    notes: string;
}
