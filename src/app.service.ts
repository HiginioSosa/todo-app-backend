import { Injectable } from '@nestjs/common';

/**
 * Servicio raíz de la aplicación.
 * Proporciona funcionalidad central de la aplicación y monitoreo de salud.
 */
@Injectable()
export class AppService {
  /**
   * Genera respuesta de health check con información del sistema.
   * Utilizado para monitorear el estado y tiempo de actividad de la aplicación.
   *
   * @returns {object} Información del health check
   * @returns {string} object.status - Estado de la aplicación ('ok')
   * @returns {string} object.timestamp - Timestamp actual en formato ISO 8601
   * @returns {number} object.uptime - Tiempo de actividad del proceso en segundos
   * @returns {string} object.environment - Entorno actual (development/production/test)
   */
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
