import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notifications.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

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
  // 앱 켜지면 여기로 토큰 보내야 함
  @Post('register')
  async registerToken(
    @Body('userId') userId: number,
    @Body('token') token: string,
  ) {
    console.log(`💾 [DB 저장] User ${userId}의 토큰을 저장합니다: ${token}`);
    
    // TODO: 나중에 DB 연결
    // await this.usersRepository.update(userId, { fcmToken: token });
    
    return { status: 'registered' };
  }
}