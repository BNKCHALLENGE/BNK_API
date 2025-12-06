import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { MissionsService } from './missions.service';
import {
  AiRecommendQueryDto,
  MissionIdParamDto,
  MissionsQueryDto,
} from './missions.types';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get('ai-recommend')
  getAiRecommend(@Req() req: Request, @Query() query: AiRecommendQueryDto) {
    const userId = (req as any).user?.id;
    return this.missionsService.getAiRecommendations(userId, query);
  }

  @Get()
  getMissions(@Query() query: MissionsQueryDto) {
    return this.missionsService.getMissions(query);
  }

  @Get(':missionId')
  getMissionById(@Param() params: MissionIdParamDto) {
    return this.missionsService.getMissionById(params);
  }

  @Post(':missionId/like')
  likeMission(@Req() req: Request, @Param() params: MissionIdParamDto) {
    const userId = (req as any).user?.id;
    return this.missionsService.likeMission(userId, params);
  }

  @Post(':missionId/participate')
  participateMission(@Req() req: Request, @Param() params: MissionIdParamDto) {
    const userId = (req as any).user?.id;
    return this.missionsService.participateInMission(userId, params);
  }
}
