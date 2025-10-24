import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');

      // Log queries in development
      if (process.env.NODE_ENV === 'development') {
        this.$on('query' as never, (e: unknown) => {
          const event = e as { query: string; duration: number };
          this.logger.debug(`Query: ${event.query} - Duration: ${event.duration}ms`);
        });
      }

      this.$on('error' as never, (e: unknown) => {
        const event = e as { message: string };
        this.logger.error(`Prisma Error: ${event.message}`);
      });
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    const models = Reflect.ownKeys(this)
      .filter((key): key is string => typeof key === 'string')
      .filter((key) => !key.startsWith('_') && !key.startsWith('$'));

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof this];
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as { deleteMany: () => Promise<unknown> }).deleteMany();
        }
        return Promise.resolve();
      }),
    );
  }

  /**
   * Utility method to check database connection
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Enable query logging
   */
  enableQueryLogging() {
    this.$on('query' as never, (e: unknown) => {
      const event = e as { query: string; params: string; duration: number };
      this.logger.log(`Query: ${event.query}`);
      this.logger.log(`Params: ${event.params}`);
      this.logger.log(`Duration: ${event.duration}ms`);
    });
  }
}
