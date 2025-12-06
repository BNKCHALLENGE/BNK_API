import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { Mission } from './entities/mission.entity';
import { MissionLike } from './entities/mission-like.entity';
import { MissionParticipation } from './entities/mission-participation.entity';
import { User } from '../users/entities/user.entity';
import { AiRecommendationService } from './ai-recommendation.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Mission, MissionLike, MissionParticipation, User]),
  ],
  controllers: [MissionsController],
  providers: [MissionsService, AiRecommendationService],
})
export class MissionsModule {}
