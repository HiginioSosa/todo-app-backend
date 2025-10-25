import { SetMetadata } from '@nestjs/common';

/**
 * Clave de metadatos para marcar rutas como públicas.
 * @constant
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar rutas como públicas (omitir autenticación JWT).
 * Usa este decorador en métodos de controlador que deben ser accesibles sin autenticación.
 *
 * @returns {MethodDecorator} Función decoradora que establece metadatos públicos
 *
 * @usageNotes
 * Aplicar a métodos de controlador:
 * ```typescript
 * @Public()
 * @Post('login')
 * async login() { ... }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
