import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

/**
 * Controlador raíz de la aplicación.
 * Proporciona el endpoint de health check para monitoreo y validación de despliegue.
 */
@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint de health check.
   * Retorna el estado de la API, tiempo de actividad e información del entorno.
   * Endpoint público - no requiere autenticación.
   *
   * @returns {object} Información del estado de salud
   * @returns {string} object.status - Estado de la API ('ok')
   * @returns {string} object.timestamp - Timestamp actual en formato ISO
   * @returns {number} object.uptime - Tiempo de actividad del proceso en segundos
   * @returns {string} object.environment - Entorno actual (development/production)
   */
  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns the health status of the API',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 12345.67 },
        environment: { type: 'string', example: 'development' },
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
