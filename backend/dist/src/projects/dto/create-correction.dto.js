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
exports.CreateCorrectionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateCorrectionDto {
}
exports.CreateCorrectionDto = CreateCorrectionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Design Revision' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCorrectionDto.prototype, "correctionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Logo needs to be updated according to brand guidelines' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCorrectionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'user123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCorrectionDto.prototype, "assignedToId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.Priority, example: client_1.Priority.HIGH }),
    (0, class_validator_1.IsEnum)(client_1.Priority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCorrectionDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCorrectionDto.prototype, "estimatedHours", void 0);
//# sourceMappingURL=create-correction.dto.js.map