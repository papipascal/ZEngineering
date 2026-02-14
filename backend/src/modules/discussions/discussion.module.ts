import { Module } from '@nestjs/common';
import { DiscussionController } from './discussion.controller.js';
import { DiscussionService } from './discussion.service.js';

@Module({
  controllers: [DiscussionController],
  providers: [DiscussionService],
  exports: [DiscussionService],
})
export class DiscussionModule {}
