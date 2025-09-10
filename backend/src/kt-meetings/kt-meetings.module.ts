import { Module } from '@nestjs/common';
import { KTMeetingsService } from './kt-meetings.service';
import { KTMeetingsController } from './kt-meetings.controller';

@Module({
  controllers: [KTMeetingsController],
  providers: [KTMeetingsService],
  exports: [KTMeetingsService],
})
export class KTMeetingsModule {}