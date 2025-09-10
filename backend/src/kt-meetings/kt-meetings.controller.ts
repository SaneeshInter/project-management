import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KTMeetingsService, CreateKTMeetingDto, UpdateKTMeetingDto, AddParticipantDto, UpdateParticipantDto } from './kt-meetings.service';

@ApiTags('kt-meetings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('kt-meetings')
export class KTMeetingsController {
  constructor(private readonly ktMeetingsService: KTMeetingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new KT meeting' })
  @ApiResponse({ status: 201, description: 'KT meeting created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  create(@Body() createKtMeetingDto: CreateKTMeetingDto, @Request() req: any) {
    return this.ktMeetingsService.create(createKtMeetingDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all KT meetings for the user' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Filter by project ID' })
  @ApiResponse({ status: 200, description: 'List of KT meetings' })
  findAll(@Request() req: any, @Query('projectId') projectId?: string) {
    return this.ktMeetingsService.findAll(req.user, projectId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming KT meetings for the user' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look ahead (default: 7)' })
  @ApiResponse({ status: 200, description: 'List of upcoming KT meetings' })
  getUpcoming(
    @Request() req: any,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number
  ) {
    return this.ktMeetingsService.getUpcomingMeetings(req.user, days);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific KT meeting by ID' })
  @ApiResponse({ status: 200, description: 'KT meeting details' })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to this meeting' })
  @ApiResponse({ status: 404, description: 'KT meeting not found' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.ktMeetingsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a KT meeting' })
  @ApiResponse({ status: 200, description: 'KT meeting updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'KT meeting not found' })
  update(
    @Param('id') id: string,
    @Body() updateKtMeetingDto: UpdateKTMeetingDto,
    @Request() req: any
  ) {
    return this.ktMeetingsService.update(id, updateKtMeetingDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a KT meeting' })
  @ApiResponse({ status: 200, description: 'KT meeting deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'KT meeting not found' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.ktMeetingsService.remove(id, req.user);
  }

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add a participant to a KT meeting' })
  @ApiResponse({ status: 201, description: 'Participant added successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'KT meeting or user not found' })
  addParticipant(
    @Param('id') meetingId: string,
    @Body() addParticipantDto: AddParticipantDto,
    @Request() req: any
  ) {
    return this.ktMeetingsService.addParticipant(meetingId, addParticipantDto, req.user);
  }

  @Delete(':id/participants/:userId')
  @ApiOperation({ summary: 'Remove a participant from a KT meeting' })
  @ApiResponse({ status: 200, description: 'Participant removed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'KT meeting or participant not found' })
  removeParticipant(
    @Param('id') meetingId: string,
    @Param('userId') userId: string,
    @Request() req: any
  ) {
    return this.ktMeetingsService.removeParticipant(meetingId, userId, req.user);
  }

  @Patch(':id/participants/:userId')
  @ApiOperation({ summary: 'Update participant details (e.g., attendance)' })
  @ApiResponse({ status: 200, description: 'Participant updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'KT meeting or participant not found' })
  updateParticipant(
    @Param('id') meetingId: string,
    @Param('userId') userId: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
    @Request() req: any
  ) {
    return this.ktMeetingsService.updateParticipant(meetingId, userId, updateParticipantDto, req.user);
  }
}