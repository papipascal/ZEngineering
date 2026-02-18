import { Controller, Sse, Query, UseGuards, MessageEvent } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { NotificationService } from './notification.service.js';
import { Observable, map } from 'rxjs';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Sse('stream')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'SSE stream of real-time notifications for a user' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'projectIds', required: false, description: 'Comma-separated project IDs' })
  stream(
    @Query('userId') userId: string,
    @Query('projectIds') projectIdsParam?: string,
  ): Observable<MessageEvent> {
    const projectIds = projectIdsParam ? projectIdsParam.split(',') : [];
    return this.notificationService.subscribe(userId, projectIds).pipe(
      map((notification) => ({
        data: notification,
        id: notification.id,
        type: notification.type,
      })),
    );
  }
}
