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

export interface MissionResponseDto {
  id: string;
  title: string;
  imageUrl: string;
  location: string;
  locationDetail: string;
  distance: string;
  coinReward: number;
  category: string;
  endDate: string;
  insight: string;
  verificationMethods: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  isLiked: boolean;
  participationStatus?: 'in_progress' | 'completed' | 'failed' | null;
  completedAt?: string | null;
}
