import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';

interface UpdatePreferencesDto {
  categories: string[];
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.usersService.getCurrentUser(userId);
  }

  @Post('me/preferences')
  async updatePreferences(@Req() req: Request, @Body() body: UpdatePreferencesDto) {
    const userId = (req as any).user?.id;
    const categories = Array.isArray(body?.categories) ? body.categories : [];
    return this.usersService.setPreferences(userId, categories);
  }

  @Get('me/preferences')
  async getPreferences(@Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.usersService.getPreferences(userId);
  }
}
