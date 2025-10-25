import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

/**
 * Bootstrap function that initializes and configures the NestJS application.
 * Sets up security middleware, CORS, validation, and Swagger documentation.
 *
 * @returns {Promise<void>} Resolves when the application is successfully started
 * @throws {Error} If the application fails to start
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Security: Helmet - Protección de headers HTTP
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: [`'self'`],
            styleSrc: [`'self'`, `'unsafe-inline'`],
            imgSrc: [`'self'`, 'data:', 'https:'],
            scriptSrc: [`'self'`],
          },
        },
        crossOriginEmbedderPolicy: false, // Permite Swagger funcionar
      }),
    );

    // Security: CORS configuration
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : ['http://localhost:5173', 'http://localhost:3000']; // Default para desarrollo

    app.enableCors({
      origin:
        process.env.NODE_ENV === 'production'
          ? allowedOrigins
          : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      maxAge: 3600, // Cache preflight requests por 1 hora
    });

    // Global prefix for all routes
    app.setGlobalPrefix('v1');

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: false, // Deshabilitado para usar transformadores manuales
        },
        // Validación de seguridad adicional
        disableErrorMessages: process.env.NODE_ENV === 'production', // No exponer detalles en prod
        stopAtFirstError: true, // Mejor rendimiento
      }),
    );

    // Swagger documentation - Solo en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('To-Do App API')
        .setDescription('REST API para gestión de tareas (To-Do App)')
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
        },
      });

      logger.log(`📚 Swagger documentation: http://localhost:${process.env.PORT || 3000}/api/docs`);
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`🏥 Health check: http://localhost:${port}/v1/health`);
    logger.log(`🔒 Security headers enabled (Helmet)`);
    logger.log(
      `🌍 CORS enabled for: ${process.env.NODE_ENV === 'production' ? allowedOrigins.join(', ') : 'development origins'}`,
    );
  } catch (error) {
    logger.error('❌ Error starting application', error);
    process.exit(1);
  }
}

void bootstrap();
