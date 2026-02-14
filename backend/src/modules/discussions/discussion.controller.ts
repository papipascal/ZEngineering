import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { DiscussionService } from './discussion.service.js';
import { CreateDiscussionDto } from './dto/create-discussion.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { DiscussionFilterDto } from './dto/discussion-filter.dto.js';

@ApiTags('Discussions')
@Controller('api/discussions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new discussion' })
  create(@Body() dto: CreateDiscussionDto) {
    return this.discussionService.createDiscussion(dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search across discussions, equipment, and vendors' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query - searches all database tables' })
  searchAll(@Query('q') q: string) {
    return this.discussionService.searchAll(q);
  }

  @Get()
  @ApiOperation({ summary: 'List discussions with optional filters' })
  findAll(@Query() filter: DiscussionFilterDto) {
    return this.discussionService.listDiscussions(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get discussion with all comments' })
  findOne(@Param('id') id: string) {
    return this.discussionService.getDiscussion(id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a discussion' })
  addComment(@Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.discussionService.addComment(id, dto);
  }

  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Delete a specific comment' })
  removeComment(@Param('commentId') commentId: string) {
    return this.discussionService.deleteComment(commentId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a discussion and its comments' })
  remove(@Param('id') id: string) {
    return this.discussionService.deleteDiscussion(id);
  }
}
