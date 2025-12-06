import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { toApiCategory } from '../missions/category-transform.util';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories() {
    const categories = await this.categoriesService.getCategories();

    return categories.map((c) => {
      const apiCategory = toApiCategory(c.id) ?? c.id;
      return {
        id: apiCategory,
        name: apiCategory,
        isActive: c.isActive,
      };
    });
  }
}
