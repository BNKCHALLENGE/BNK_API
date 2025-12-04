import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AiRecommendationService {
  constructor(private readonly httpService: HttpService) {}

  async getRecommendedMissionIds(userId: string, limit: number): Promise<string[]> {
    // Reserved client for future FastAPI integration
    const client = this.httpService.axiosRef;
    void client;

    // TODO: Replace mock with FastAPI request.
    // Example:
    // const { data } = await this.httpService.axiosRef.post<{ ids: string[] }>(
    //   `${process.env.AI_BASE_URL}/recommend`,
    //   { userId, limit },
    //   { timeout: 3000 },
    // );
    // return data.ids;

    return ['mission-1', 'mission-3', 'mission-5'];
  }
}
