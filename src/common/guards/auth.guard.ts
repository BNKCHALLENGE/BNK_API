import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization: string | undefined = request.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const userId = authorization.replace('Bearer ', '').trim();
    
    if (!userId) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    request.user = {
      id: userId,
    };

    return true;
  }
}
