import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 루트 경로: 기본 서버 정보 출력
  @Get('/')
  getRoot() {
    return {
      status: 'OK',
      service: 'BNK Challenge Server',
      message: 'Server is running successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // 기존 헬스 체크
  @Get('health')
  getHealth(): string {
    return this.appService.getHealth();
  }
}
