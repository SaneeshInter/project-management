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
exports.CreateApprovalDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateApprovalDto {
}
exports.CreateApprovalDto = CreateApprovalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ApprovalType, example: client_1.ApprovalType.CLIENT_APPROVAL }),
    (0, class_validator_1.IsEnum)(client_1.ApprovalType),
    __metadata("design:type", String)
], CreateApprovalDto.prototype, "approvalType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Design looks great, approved for development' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateApprovalDto.prototype, "comments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['screenshot1.png', 'feedback.pdf'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateApprovalDto.prototype, "attachments", void 0);
//# sourceMappingURL=create-approval.dto.js.map