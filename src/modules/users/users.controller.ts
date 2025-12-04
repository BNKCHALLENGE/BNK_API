import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';

interface UpdatePreferencesDto {
  categories: string[];
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Headers('authorization') authorization?: string) {
    this.ensureAuthorized(authorization);
    return this.usersService.getCurrentUser();
  }

  @Post('me/preferences')
  async updatePreferences(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: UpdatePreferencesDto,
  ) {
    this.ensureAuthorized(authorization);
    const categories = Array.isArray(body?.categories) ? body.categories : [];
    return this.usersService.setPreferences(categories);
  }

  @Get('me/preferences')
  async getPreferences(@Headers('authorization') authorization?: string) {
    this.ensureAuthorized(authorization);
    return this.usersService.getPreferences();
  }

  private ensureAuthorized(authorization?: string) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header is required');
    }
  }
}
