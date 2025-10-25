import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Servicio de base de datos Prisma que extiende PrismaClient.
 * Maneja el ciclo de vida de la conexión a la base de datos y proporciona métodos de utilidad.
 * Configurado con logging basado en eventos y gestión automática de conexión.
 */
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

  /**
   * Hook de ciclo de vida llamado cuando el módulo es inicializado.
   * Conecta a la base de datos y configura los listeners de eventos.
   *
   * @returns {Promise<void>} Se resuelve cuando la conexión es establecida
   * @throws {Error} Si la conexión a la base de datos falla
   */
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

  /**
   * Hook de ciclo de vida llamado cuando el módulo es destruido.
   * Desconecta de la base de datos de forma elegante.
   *
   * @returns {Promise<void>} Se resuelve cuando la desconexión es completa
   */
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }

  /**
   * Limpia todos los datos de la base de datos.
   * Solo permitido en entornos no productivos para propósitos de prueba.
   *
   * @returns {Promise<unknown[]>} Array de resultados de eliminación
   * @throws {Error} Si se llama en entorno de producción
   */
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
   * Verifica si la conexión a la base de datos está activa.
   * Ejecuta una consulta simple para verificar la conectividad.
   *
   * @returns {Promise<boolean>} True si está conectado, false en caso contrario
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
   * Habilita el logging detallado de consultas.
   * Registra consultas SQL, parámetros y duración de ejecución.
   * Útil para debugging y monitoreo de rendimiento.
   *
   * @returns {void}
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
