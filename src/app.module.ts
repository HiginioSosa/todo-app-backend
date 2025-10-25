import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TodoModule } from './modules/todo/todo.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { envConfig } from './config/env.config';

/**
 * Root application module.
 * Configures global modules, guards, and application-wide settings.
 *
 * Global Guards:
 * - JwtAuthGuard: Requires JWT authentication on all routes by default (use @Public() to bypass)
 * - ThrottlerGuard: Rate limiting to prevent brute force and DDoS attacks
 *
 * Rate Limits:
 * - Short: 10 requests per second
 * - Medium: 100 requests per minute
 * - Long: 1000 requests per hour
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [envConfig],
    }),
    // Rate limiting - Protección contra brute force y DDoS
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 10, // 10 requests por segundo
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hora
        limit: 1000, // 1000 requests por hora
      },
    ]),
    PrismaModule,
    AuthModule,
    TodoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // JWT Auth Guard - Verifica tokens en todas las rutas
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Throttler Guard - Rate limiting global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
