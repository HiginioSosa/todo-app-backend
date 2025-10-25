import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

/**
 * Custom JWT authentication guard with support for public routes.
 * Applied globally in AppModule - all routes require JWT by default.
 * Use @Public() decorator to bypass authentication on specific routes.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determines if the route can be activated.
   * Checks for @Public() decorator metadata to allow unauthenticated access.
   *
   * @param {ExecutionContext} context - Execution context containing request metadata
   * @returns {boolean | Promise<boolean>} True if route can be accessed
   */
  canActivate(context: ExecutionContext) {
    // Verificar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Handles the authentication request result.
   * Throws UnauthorizedException if token is invalid or user not found.
   *
   * @param {Error | null} err - Error from passport strategy
   * @param {TUser} user - User object from JWT payload
   * @param {Error | null} _info - Additional info (unused)
   * @returns {TUser} Validated user object
   * @throws {UnauthorizedException} If authentication fails
   */
  handleRequest<TUser = unknown>(err: Error | null, user: TUser, _info: Error | null): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o expirado');
    }
    return user;
  }
}
