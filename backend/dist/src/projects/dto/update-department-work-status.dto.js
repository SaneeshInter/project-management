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
exports.UpdateDepartmentWorkStatusDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class UpdateDepartmentWorkStatusDto {
}
exports.UpdateDepartmentWorkStatusDto = UpdateDepartmentWorkStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.DepartmentWorkStatus, example: client_1.DepartmentWorkStatus.IN_PROGRESS }),
    (0, class_validator_1.IsEnum)(client_1.DepartmentWorkStatus),
    __metadata("design:type", String)
], UpdateDepartmentWorkStatusDto.prototype, "workStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-08-29T00:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDepartmentWorkStatusDto.prototype, "workStartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-09-05T00:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDepartmentWorkStatusDto.prototype, "workEndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 7 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDepartmentWorkStatusDto.prototype, "actualDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Work completed ahead of schedule' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDepartmentWorkStatusDto.prototype, "notes", void 0);
//# sourceMappingURL=update-department-work-status.dto.js.map