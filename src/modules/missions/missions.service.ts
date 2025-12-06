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
import { AiRecommendationService, RecommendationResult, UserContext } from './ai-recommendation.service';
import { User } from '../users/entities/user.entity';
import { toApiCategory, toMlCategory } from './category-transform.util';
import { apiIdToMlId, mlIdToApiId } from './mission-id.transform';
import { userIdToMlId } from './user-id.transform';

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
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly aiRecommendationService: AiRecommendationService,
  ) {}

  async getAiRecommendations(userId: string, query: AiRecommendQueryDto): Promise<MissionResponseDto[]> {
    const resolvedUserId = userId;
    const limit = query.limit && query.limit > 0 ? query.limit : 5;

    const userContext = resolvedUserId
      ? await this.buildUserContext(resolvedUserId, Number(query.lat), Number(query.lon))
      : null;

    const recommendations: RecommendationResult[] = userContext
      ? await this.aiRecommendationService.getRecommendations(userContext, limit)
      : [];

    if (recommendations.length) {
      const missionIds = recommendations.map((r) => r.mission_id);
      const missions = await this.missionsRepository.find({
        where: { id: In(missionIds) },
      });
      const missionMap = new Map(missions.map((m) => [m.id, m]));
      const ordered = recommendations
        .map((rec) => {
          const mission = missionMap.get(rec.mission_id);
          if (!mission) return null;
          return this.toMissionResponseDto(mission, undefined, rec);
        })
        .filter((m): m is MissionResponseDto => !!m);
      if (ordered.length) {
        return ordered;
      }
    }

    const fallback = await this.getPopularMissions(limit);
    return fallback.map((mission) => this.toMissionResponseDto(mission));
  }

  async getMissions(userId: string | undefined, query: MissionsQueryDto): Promise<MissionsListResponse> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const qb = this.missionsRepository.createQueryBuilder('mission');

    if (query.category) {
      const mlCategory = toMlCategory(query.category);
      if (mlCategory) {
        qb.andWhere('mission.category = :category', { category: mlCategory });
      }
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

    const participationMap = await this.getParticipationMap(userId, missions.map((m) => m.id));

    return {
      missions: missions.map((mission) =>
        this.toMissionResponseDto(mission, participationMap.get(mission.id)),
      ),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
      },
    };
  }

  async getMissionById(userId: string | undefined, params: MissionIdParamDto): Promise<MissionResponseDto> {
    const mlMissionId = apiIdToMlId(params.missionId) ?? params.missionId;
    const mission = await this.missionsRepository.findOne({
      where: { id: mlMissionId },
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }
    const participation = await this.getParticipationForMission(userId, mission.id);
    return this.toMissionResponseDto(mission, participation);
  }

  async likeMission(userId: string, params: MissionIdParamDto) {
    const mlMissionId = apiIdToMlId(params.missionId) ?? params.missionId;
    const mission = await this.missionsRepository.findOne({
      where: { id: mlMissionId },
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
    const mlMissionId = apiIdToMlId(params.missionId) ?? params.missionId;
    const mission = await this.missionsRepository.findOne({
      where: { id: mlMissionId },
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

  async completeMission(userId: string, missionId: string, success: boolean) {
    const mlMissionId = apiIdToMlId(missionId) ?? missionId;
    return this.missionsRepository.manager.transaction(async (manager) => {
      const mission = await manager.findOne(Mission, { where: { id: mlMissionId } });
      if (!mission) {
        throw new NotFoundException('Mission not found');
      }

      const participation = await manager.findOne(MissionParticipation, {
        where: { missionId: mlMissionId, userId },
      });
      if (!participation) {
        throw new BadRequestException('No participation found for this mission');
      }

      if (participation.status === 'completed') {
        throw new BadRequestException('Mission already completed');
      }

      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (success) {
        participation.status = 'completed';
        participation.completedAt = new Date();
        user.coinBalance = (user.coinBalance ?? 0) + mission.coinReward;
        await manager.save([participation, user]);
      } else {
        participation.status = 'failed';
        participation.completedAt = null;
        await manager.save(participation);
      }

      return {
        missionId: mission.id,
        userId,
        status: participation.status,
        reward: success ? mission.coinReward : 0,
        coinBalance: user.coinBalance ?? 0,
      };
    });
  }

  private toMissionResponseDto(
    mission: Mission,
    participation?: MissionParticipation | null,
    recommendation?: RecommendationResult,
  ): MissionResponseDto {
    const distanceMeters = recommendation?.distance_m ?? mission.distance ?? 0;
    const distance = `${(distanceMeters / 1000).toFixed(1)}km`;
    return {
      id: mlIdToApiId(mission.id) ?? mission.id,
      title: mission.title,
      imageUrl: mission.imageUrl ?? 'https://example.com/placeholder.jpg',
      location: mission.location ?? 'Busan',
      locationDetail: mission.locationDetail,
      distance,
      coinReward: mission.coinReward,
      category: toApiCategory(mission.category) ?? mission.category,
      endDate: mission.endDate,
      insight: mission.insight,
      verificationMethods: mission.verificationMethods ?? [],
      coordinates: mission.coordinates,
      isLiked: mission.isLiked,
      participationStatus: participation ? participation.status : null,
      completedAt: participation?.completedAt ? participation.completedAt.toISOString() : null,
      modelProba: recommendation?.model_proba,
      finalScore: recommendation?.final_score,
      distanceMeters,
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

  private async getParticipationMap(
    userId: string | undefined,
    missionIds: string[],
  ): Promise<Map<string, MissionParticipation>> {
    if (!userId || missionIds.length === 0) {
      return new Map();
    }
    const participations = await this.missionParticipationsRepository.find({
      where: { userId, missionId: In(missionIds) },
    });
    return new Map(participations.map((p) => [p.missionId, p]));
  }

  private async getParticipationForMission(
    userId: string | undefined,
    missionId: string,
  ): Promise<MissionParticipation | null> {
    if (!userId) return null;
    const participation = await this.missionParticipationsRepository.findOne({
      where: { userId, missionId },
    });
    return participation ?? null;
  }

  private async buildUserContext(
    userId: string,
    userLat?: number,
    userLon?: number,
  ): Promise<UserContext | null> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return null;
    const prefs = (user.preferences as any) ?? {};
    const jsDay = new Date().getDay(); // 0=Sun .. 6=Sat
    const mlDay = (jsDay + 6) % 7; // 0=Mon .. 6=Sun
    return {
      user_id: userIdToMlId(user.id) ?? user.id,
      age: user.age ?? undefined,
      gender: user.gender ?? undefined,
      user_lat: userLat,
      user_lon: userLon,
      pref_tags: Array.isArray(prefs.categories)
        ? prefs.categories.map(toMlCategory).filter((c): c is string => !!c)
        : [],
      acceptance_rate: user.acceptanceRate ?? 0,
      active_time_slot: user.activeTimeSlot ?? 'Day',
      current_day_of_week: mlDay,
      current_weather: getRandomWeather(),
    };
  }
}

function getRandomWeather(): string {
  const weathers = ['Sunny', 'Cloudy', 'Rainy', 'Snowy'];
  return weathers[Math.floor(Math.random() * weathers.length)];
}

