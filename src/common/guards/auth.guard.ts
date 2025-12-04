import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required');
    }

    // Pass-through guard: attach mock user and allow the request.
    request.user = {
      id: 'user-1',
      name: '채수원',
    };

    return true;
  }
}
