import { Controller, Get, Param, Post, Query } from '@nestjs/common';
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
  getAiRecommend(@Query() query: AiRecommendQueryDto) {
    return this.missionsService.getAiRecommendations(query);
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
  likeMission(@Param() params: MissionIdParamDto) {
    return this.missionsService.likeMission(params);
  }

  @Post(':missionId/participate')
  participateMission(@Param() params: MissionIdParamDto) {
    return this.missionsService.participateInMission(params);
  }
}
