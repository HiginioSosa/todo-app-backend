import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@modules/prisma/prisma.service';

/**
 * JWT token payload structure.
 *
 * @property {string} sub - Subject (User ID)
 * @property {string} email - User email address
 * @property {number} [iat] - Issued at timestamp
 * @property {number} [exp] - Expiration timestamp
 */
export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Passport JWT strategy for validating JWT tokens.
 * Extracts token from Authorization header, validates signature,
 * and verifies user existence in database.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Validates JWT payload and retrieves user from database.
   * Called automatically by Passport after token signature verification.
   * The returned user object is attached to the request object.
   *
   * @param {JwtPayload} payload - Decoded JWT payload
   * @returns {Promise<object>} User object without password
   * @throws {UnauthorizedException} If user is not found in database
   */
  async validate(payload: JwtPayload) {
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        nombre: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}
