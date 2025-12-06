import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MissionsModule } from './modules/missions/missions.module';
import { TabsModule } from './modules/tabs/tabs.module';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Railway Postgres 연결 설정 (정답)
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,  // DB_HOST/PORT 안 씀
      ssl: { rejectUnauthorized: false }, // Railway requires this
      autoLoadEntities: true,
      synchronize: true, // 운영은 절대 true 금지
    }),

    NotificationModule,
    UsersModule,
    CategoriesModule,
    MissionsModule,
    TabsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
