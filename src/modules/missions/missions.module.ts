import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { Mission } from './entities/mission.entity';
import { MissionLike } from './entities/mission-like.entity';
import { MissionParticipation } from './entities/mission-participation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mission, MissionLike, MissionParticipation])],
  controllers: [MissionsController],
  providers: [MissionsService],
})
export class MissionsModule {}
