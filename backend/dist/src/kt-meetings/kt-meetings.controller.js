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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KTMeetingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const kt_meetings_service_1 = require("./kt-meetings.service");
let KTMeetingsController = class KTMeetingsController {
    constructor(ktMeetingsService) {
        this.ktMeetingsService = ktMeetingsService;
    }
    create(createKtMeetingDto, req) {
        return this.ktMeetingsService.create(createKtMeetingDto, req.user);
    }
    findAll(req, projectId) {
        return this.ktMeetingsService.findAll(req.user, projectId);
    }
    getUpcoming(req, days) {
        return this.ktMeetingsService.getUpcomingMeetings(req.user, days);
    }
    findOne(id, req) {
        return this.ktMeetingsService.findOne(id, req.user);
    }
    update(id, updateKtMeetingDto, req) {
        return this.ktMeetingsService.update(id, updateKtMeetingDto, req.user);
    }
    remove(id, req) {
        return this.ktMeetingsService.remove(id, req.user);
    }
    addParticipant(meetingId, addParticipantDto, req) {
        return this.ktMeetingsService.addParticipant(meetingId, addParticipantDto, req.user);
    }
    removeParticipant(meetingId, userId, req) {
        return this.ktMeetingsService.removeParticipant(meetingId, userId, req.user);
    }
    updateParticipant(meetingId, userId, updateParticipantDto, req) {
        return this.ktMeetingsService.updateParticipant(meetingId, userId, updateParticipantDto, req.user);
    }
};
exports.KTMeetingsController = KTMeetingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new KT meeting' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'KT meeting created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Project not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], KTMeetingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all KT meetings for the user' }),
    (0, swagger_1.ApiQuery)({ name: 'projectId', required: false, description: 'Filter by project ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of KT meetings' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], KTMeetingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming KT meetings for the user' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, description: 'Number of days to look ahead (default: 7)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of upcoming KT meetings' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('days', new common_1.DefaultValuePipe(7), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], KTMeetingsController.prototype, "getUpcoming", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific KT meeting by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KT meeting details' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - no access to this meeting' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KT meeting not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], KTMeetingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a KT meeting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KT meeting updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KT meeting not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], KTMeetingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a KT meeting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KT meeting deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KT meeting not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], KTMeetingsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/participants'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a participant to a KT meeting' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Participant added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KT meeting or user not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], KTMeetingsController.prototype, "addParticipant", null);
__decorate([
    (0, common_1.Delete)(':id/participants/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a participant from a KT meeting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Participant removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KT meeting or participant not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], KTMeetingsController.prototype, "removeParticipant", null);
__decorate([
    (0, common_1.Patch)(':id/participants/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update participant details (e.g., attendance)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Participant updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KT meeting or participant not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], KTMeetingsController.prototype, "updateParticipant", null);
exports.KTMeetingsController = KTMeetingsController = __decorate([
    (0, swagger_1.ApiTags)('kt-meetings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('kt-meetings'),
    __metadata("design:paramtypes", [kt_meetings_service_1.KTMeetingsService])
], KTMeetingsController);
//# sourceMappingURL=kt-meetings.controller.js.map