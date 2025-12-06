import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { NotificationService } from './notifications.service';
import { UsersService } from '../users/users.service';

class BroadcastChallengeDto {
  title?: string;
  body?: string;
}

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
  ) {}

  @Post('send')
  async sendNotification(
    @Body('token') token: string,
    @Body('title') title: string,
    @Body('body') body: string,
  ) {
    await this.notificationService.sendPushNotification(token, title, body);
    return { status: 'sent' };
  }

  @Post('register')
  async registerToken(
    @Req() req: Request,
    @Body('userId') bodyUserId: string,
    @Body('token') token: string,
  ) {
    const authUserId = (req as any).user?.id;
    const targetUserId = bodyUserId || authUserId;
    await this.usersService.saveFcmToken(targetUserId, token);
    return { status: 'registered' };
  }

  @Post('broadcast-challenge')
  async broadcastChallenge(@Body() dto: BroadcastChallengeDto) {
    const users = await this.usersService.getAllWithFcmToken();
    if (!users.length) {
      return { status: 'no_tokens', sentCount: 0 };
    }

    const title = dto.title ?? '오늘의 BNK 챌린지';
    const body = dto.body ?? '부산 핫플 미션을 깨고 코인을 모아보세요!';

    const tokens = users
      .map((user) => user.fcmToken)
      .filter((token): token is string => !!token && token.length > 0);

    await this.notificationService.sendBulkNotification(tokens, title, body);

    return {
      status: 'sent',
      sentCount: tokens.length,
    };
  }
}
