import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  AiRecommendQueryDto,
  MissionIdParamDto,
  MissionsQueryDto,
  MissionResponseDto,
} from './missions.types';
import { Mission } from './entities/mission.entity';
import { MissionLike } from './entities/mission-like.entity';
import { MissionParticipation } from './entities/mission-participation.entity';
import { AiRecommendationService } from './ai-recommendation.service';

export interface MissionsListResponse {
  missions: MissionResponseDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
  };
}

@Injectable()
export class MissionsService {

  constructor(
    @InjectRepository(Mission)
    private readonly missionsRepository: Repository<Mission>,
    @InjectRepository(MissionLike)
    private readonly missionLikesRepository: Repository<MissionLike>,
    @InjectRepository(MissionParticipation)
    private readonly missionParticipationsRepository: Repository<MissionParticipation>,
    private readonly aiRecommendationService: AiRecommendationService,
  ) {}

  async getAiRecommendations(userId: string, query: AiRecommendQueryDto): Promise<MissionResponseDto[]> {
    const resolvedUserId = query.userId || userId;
    const limit = query.limit && query.limit > 0 ? query.limit : 5;

    let recommendedIds: string[] = [];
    try {
      recommendedIds = await this.aiRecommendationService.getRecommendedMissionIds(resolvedUserId, limit);
    } catch {
      recommendedIds = [];
    }

    if (recommendedIds.length) {
      const missions = await this.missionsRepository.find({
        where: { id: In(recommendedIds) },
      });
      const missionMap = new Map(missions.map((m) => [m.id, m]));
      const ordered = recommendedIds
        .map((id) => missionMap.get(id))
        .filter((m): m is Mission => !!m)
        .map((mission) => this.toMissionResponseDto(mission));
      if (ordered.length) {
        return ordered;
      }
    }

    const fallback = await this.getPopularMissions(limit);
    return fallback.map((mission) => this.toMissionResponseDto(mission));
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
      missions: missions.map((mission) => this.toMissionResponseDto(mission)),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
      },
    };
  }

  async getMissionById(params: MissionIdParamDto): Promise<MissionResponseDto> {
    const mission = await this.missionsRepository.findOne({
      where: { id: params.missionId },
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }
    return this.toMissionResponseDto(mission);
  }

  async likeMission(userId: string, params: MissionIdParamDto) {
    const mission = await this.missionsRepository.findOne({
      where: { id: params.missionId },
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    let like = await this.missionLikesRepository.findOne({
      where: { missionId: mission.id, userId },
    });

    if (!like) {
      like = this.missionLikesRepository.create({
        missionId: mission.id,
        userId,
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

  async participateInMission(userId: string, params: MissionIdParamDto) {
    const mission = await this.missionsRepository.findOne({
      where: { id: params.missionId },
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    const existing = await this.missionParticipationsRepository.findOne({
      where: { missionId: mission.id, userId },
    });
    if (existing) {
      throw new BadRequestException('Already participating in this mission');
    }

    const participation = this.missionParticipationsRepository.create({
      missionId: mission.id,
      userId,
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

  private toMissionResponseDto(mission: Mission): MissionResponseDto {
    return {
      id: mission.id,
      title: mission.title,
      imageUrl: mission.imageUrl,
      location: mission.location,
      locationDetail: mission.locationDetail,
      distance: `${(mission.distance / 1000).toFixed(1)}km`,
      coinReward: mission.coinReward,
      category: mission.category,
      endDate: mission.endDate,
      insight: mission.insight,
      verificationMethods: mission.verificationMethods ?? [],
      coordinates: mission.coordinates,
      isLiked: mission.isLiked,
    };
  }

  private async getPopularMissions(limit: number): Promise<Mission[]> {
    const qb = this.missionsRepository
      .createQueryBuilder('mission')
      .leftJoin('mission.likes', 'like', 'like.isLiked = true')
      .addSelect('COUNT(like.id)', 'likeCount')
      .groupBy('mission.id')
      .orderBy('likeCount', 'DESC')
      .addOrderBy('mission.distance', 'ASC')
      .take(limit);

    return qb.getMany();
  }
}
