export class AiRecommendQueryDto {
  lat!: number;
  lon!: number;
  limit?: number;
}

export class MissionsQueryDto {
  category?: string;
  sort?: 'distance' | 'popular' | 'recent';
  page?: number;
  limit?: number;
  lat?: number;
  lon?: number;
}

export class MissionIdParamDto {
  missionId!: string;
}

export interface MissionResponseDto {
  id: string;
  title: string;
  imageUrl: string | null | undefined;
  location: string | null | undefined;
  locationDetail: string | null | undefined;
  distance: string;
  coinReward: number;
  category: string;
  endDate: string | null;
  insight: string | null;
  verificationMethods: string[];
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  isLiked: boolean;
  participationStatus?: string | null;
  completedAt?: string | null;
  modelProba?: number;
  finalScore?: number;
  distanceMeters?: number;
}
