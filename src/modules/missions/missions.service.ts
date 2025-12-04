import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AiRecommendQueryDto,
  MissionIdParamDto,
  MissionsQueryDto,
} from './missions.types';
import { Mission } from './entities/mission.entity';
import { MissionLike } from './entities/mission-like.entity';
import { MissionParticipation } from './entities/mission-participation.entity';

interface MissionsListResponse {
  missions: Mission[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
  };
}

@Injectable()
export class MissionsService {
  private readonly userId = 'user-1';

  constructor(
    @InjectRepository(Mission)
    private readonly missionsRepository: Repository<Mission>,
    @InjectRepository(MissionLike)
    private readonly missionLikesRepository: Repository<MissionLike>,
    @InjectRepository(MissionParticipation)
    private readonly missionParticipationsRepository: Repository<MissionParticipation>,
  ) {}

  async getAiRecommendations(_query: AiRecommendQueryDto) {
    // TODO: Integrate with ML service (FastAPI) for recommendations
    return [];
  }

  async getMissions(query: MissionsQueryDto): Promise<MissionsListResponse> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const qb = this.missionsRepository.createQueryBuilder('mission');

    if (query.category) {
      qb.andWhere('mission.category = :category', { category: query.category });
    }

    switch (query.sort) {
      case 'popular':
        qb.leftJoin('mission.likes', 'like', 'like.isLiked = true')
          .addSelect('COUNT(like.id)', 'likeCount')
          .groupBy('mission.id')
          .orderBy('likeCount', 'DESC');
        break;
      case 'recent':
        qb.orderBy('mission.endDate', 'DESC');
        break;
      case 'distance':
      default:
        qb.orderBy('mission.distance', 'ASC');
        break;
    }

    qb.skip((page - 1) * limit).take(limit);

    const [missions, totalCount] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalCount / limit);

    return {
      missions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
      },
    };
  }

  async getMissionById(params: MissionIdParamDto): Promise<Mission> {
    const mission = await this.missionsRepository.findOne({
      where: { id: params.missionId },
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }
    return mission;
  }

  async likeMission(params: MissionIdParamDto) {
    const mission = await this.missionsRepository.findOne({
      where: { id: params.missionId },
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    let like = await this.missionLikesRepository.findOne({
      where: { missionId: mission.id, userId: this.userId },
    });

    if (!like) {
      like = this.missionLikesRepository.create({
        missionId: mission.id,
        userId: this.userId,
        isLiked: true,
      });
    } else {
      like.isLiked = !like.isLiked;
    }

    await this.missionLikesRepository.save(like);

    const likeCount = await this.missionLikesRepository.count({
      where: { missionId: mission.id, isLiked: true },
    });

    return { isLiked: like.isLiked, likeCount };
  }

  async participateInMission(params: MissionIdParamDto) {
    const mission = await this.missionsRepository.findOne({
      where: { id: params.missionId },
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    const existing = await this.missionParticipationsRepository.findOne({
      where: { missionId: mission.id, userId: this.userId },
    });
    if (existing) {
      throw new BadRequestException('Already participating in this mission');
    }

    const participation = this.missionParticipationsRepository.create({
      missionId: mission.id,
      userId: this.userId,
      status: 'in_progress',
      participatedAt: new Date(),
    });

    const saved = await this.missionParticipationsRepository.save(participation);
    return {
      participationId: saved.id,
      status: saved.status,
      startedAt: saved.participatedAt.toISOString(),
    };
  }
}
