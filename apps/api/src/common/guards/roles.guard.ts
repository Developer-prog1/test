import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_ERROR_CODES, type Role } from '@gymhub/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException({
        code: API_ERROR_CODES.FORBIDDEN,
        message: 'Insufficient role',
      });
    }
    return true;
  }
}
