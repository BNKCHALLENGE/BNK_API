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

  // 1. [테스트] 프론트가 직접 알림을 쏴보는 곳
  @Post('send')
  async sendNotification(
    @Body('token') token: string,
    @Body('title') title: string,
    @Body('body') body: string,
  ) {
    await this.notificationService.sendPushNotification(token, title, body);
    return { status: 'sent' };
  }

  // 2. [실제] 앱 켜지면 토큰을 백엔드에 등록하는 곳
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

    const title = dto.title ?? 'BNK 챌린지 도전 알림';
    const body =
      dto.body ?? '지금 BNK 챌린지에 도전해보세요! 오늘도 미션 달성하고 리워드를 받아보세요.';

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
