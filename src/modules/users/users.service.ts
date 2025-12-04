import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export interface UserPreferences {
  categories: string[];
  isOnboardingComplete: boolean;
}

@Injectable()
export class UsersService {
  private readonly userId = 'user-1';

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getCurrentUser(): Promise<User> {
    return this.getUserOrThrow();
  }

  async setPreferences(categories: string[]): Promise<UserPreferences> {
    const user = await this.getUserOrThrow();
    const preferences: UserPreferences = {
      categories,
      isOnboardingComplete: categories.length > 0,
    };
    await this.usersRepository.update(user.id, { preferences: preferences as any });
    return preferences;
  }

  async getPreferences(): Promise<UserPreferences> {
    const user = await this.getUserOrThrow();
    const preferences = user.preferences as UserPreferences | undefined;
    return (
      preferences ?? {
        categories: [],
        isOnboardingComplete: false,
      }
    );
  }

  private async getUserOrThrow(): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: this.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
