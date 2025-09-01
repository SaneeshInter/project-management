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
exports.CreateDepartmentTransitionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateDepartmentTransitionDto {
}
exports.CreateDepartmentTransitionDto = CreateDepartmentTransitionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.Department, example: client_1.Department.DESIGN }),
    (0, class_validator_1.IsEnum)(client_1.Department),
    __metadata("design:type", String)
], CreateDepartmentTransitionDto.prototype, "toDepartment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateDepartmentTransitionDto.prototype, "estimatedDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'user123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDepartmentTransitionDto.prototype, "permissionGrantedById", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Moving to design phase as requirements are finalized' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDepartmentTransitionDto.prototype, "notes", void 0);
//# sourceMappingURL=create-department-transition.dto.js.map