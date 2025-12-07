import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

export interface UserContext {
  user_id: string;
  age?: number;
  gender?: string;
  last_lat?: number;
  last_lon?: number;
  pref_tags?: string[];
  acceptance_rate?: number;
  active_time_slot?: string;
  current_hour?: number;
  current_day_of_week?: number;
  current_weather?: string;
}

export interface RecommendationResult {
  mission_id: string;
  model_proba?: number;
  final_score?: number;
  priority_weight?: number;
  distance_m?: number;
}

@Injectable()
export class AiRecommendationService {
  private readonly logger = new Logger(AiRecommendationService.name);

  constructor(private readonly httpService: HttpService) {}

  async getRecommendations(userContext: UserContext, limit: number): Promise<RecommendationResult[]> {
    const url = `${process.env.ML_SERVER_URL}/recommend`;
    try {
      const { data } = await this.httpService.axiosRef.post<{
        recommendations?: RecommendationResult[];
      }>(url, { ...userContext, limit }, { timeout: 5000 });
      if (Array.isArray(data?.recommendations)) {
        return data.recommendations;
      }
    } catch (error) {
      this.logger.error('AI recommendation request failed', error as any);
    }
    return [];
  }
}
