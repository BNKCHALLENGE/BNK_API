import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async getCategories(): Promise<Category[]> {
    const count = await this.categoriesRepository.count();
    if (count === 0) {
      await this.seedCategories();
    }
    return this.categoriesRepository.find();
  }

  private async seedCategories() {
    const seedData: Partial<Category>[] = [
      { id: 'cat-1', name: '예체', isActive: true },
      { id: 'cat-2', name: '외식카페', isActive: false },
      { id: 'cat-3', name: '관광명소', isActive: false },
      { id: 'cat-4', name: '문화여가', isActive: false },
      { id: 'cat-5', name: '축제행사', isActive: false },
    ];
    await this.categoriesRepository.save(seedData);
  }
}
