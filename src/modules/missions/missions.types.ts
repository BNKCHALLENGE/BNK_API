export class AiRecommendQueryDto {
  userId?: string;
  limit?: number;
}

export class MissionsQueryDto {
  category?: string;
  sort?: 'distance' | 'popular' | 'recent';
  page?: number;
  limit?: number;
}

export class MissionIdParamDto {
  missionId!: string;
}
