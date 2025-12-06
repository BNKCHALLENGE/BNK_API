import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserResponseDto } from './users.types';

export interface UserPreferences {
  categories: string[];
  isOnboardingComplete: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.getUserOrThrow(userId);
    const prefs = (user.preferences as any) ?? {
      categories: [],
      isOnboardingComplete: false,
    };

    return {
      id: user.id,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      gender: user.gender ?? undefined,
      age: user.age ?? undefined,
      coinBalance: user.coinBalance ?? 0,
      preferences: {
        categories: prefs.categories ?? [],
        isOnboardingComplete: !!prefs.isOnboardingComplete,
      },
    };
  }

  async setPreferences(userId: string, categories: string[]): Promise<UserPreferences> {
    const user = await this.getUserOrThrow(userId);
    const preferences: UserPreferences = {
      categories,
      isOnboardingComplete: categories.length > 0,
    };
    await this.usersRepository.update(user.id, { preferences: preferences as any });
    return preferences;
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    const user = await this.getUserOrThrow(userId);
    const preferences = user.preferences as UserPreferences | undefined;
    return (
      preferences ?? {
        categories: [],
        isOnboardingComplete: false,
      }
    );
  }

  async saveFcmToken(userId: string, token: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!token) {
      throw new BadRequestException('FCM token is required');
    }
    await this.usersRepository.update(userId, { fcmToken: token });
  }

  private async getUserOrThrow(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getAllWithFcmToken(): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.fcmToken IS NOT NULL')
      .andWhere("user.fcmToken <> ''")
      .getMany();
  }
}
