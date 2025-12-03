import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationModule } from './notifications/notifications.module';

@Module({
  imports: [ScheduleModule.forRoot(), NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
