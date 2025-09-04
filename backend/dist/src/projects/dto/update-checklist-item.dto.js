"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChecklistItemUpdateDto = exports.CreateChecklistItemLinkDto = exports.UpdateChecklistItemDto = exports.ChecklistItemLinkDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ChecklistItemLinkDto {
}
exports.ChecklistItemLinkDto = ChecklistItemLinkDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChecklistItemLinkDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChecklistItemLinkDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['document', 'link', 'reference'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['document', 'link', 'reference']),
    __metadata("design:type", String)
], ChecklistItemLinkDto.prototype, "type", void 0);
class UpdateChecklistItemDto {
}
exports.UpdateChecklistItemDto = UpdateChecklistItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateChecklistItemDto.prototype, "isCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChecklistItemDto.prototype, "completedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChecklistItemDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ChecklistItemLinkDto], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateChecklistItemDto.prototype, "links", void 0);
class CreateChecklistItemLinkDto {
}
exports.CreateChecklistItemLinkDto = CreateChecklistItemLinkDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChecklistItemLinkDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChecklistItemLinkDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['document', 'link', 'reference'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['document', 'link', 'reference']),
    __metadata("design:type", String)
], CreateChecklistItemLinkDto.prototype, "type", void 0);
class CreateChecklistItemUpdateDto {
}
exports.CreateChecklistItemUpdateDto = CreateChecklistItemUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChecklistItemUpdateDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChecklistItemUpdateDto.prototype, "notes", void 0);
//# sourceMappingURL=update-checklist-item.dto.js.map