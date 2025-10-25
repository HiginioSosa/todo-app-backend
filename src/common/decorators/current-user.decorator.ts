import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador de parámetro para extraer el usuario autenticado de la petición.
 * El objeto usuario es adjuntado a la petición por la estrategia JWT después de una autenticación exitosa.
 *
 * @returns {ParameterDecorator} Función decoradora que extrae el usuario de la petición
 *
 * @usageNotes
 * Usar en métodos de controlador para acceder al usuario autenticado:
 * ```typescript
 * @Get('profile')
 * async getProfile(@CurrentUser() user: { id: string }) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
