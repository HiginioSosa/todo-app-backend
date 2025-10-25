import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for authentication responses.
 * Returned after successful login or registration.
 */
export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;

  @ApiProperty({
    example: 'bearer',
    description: 'Tipo de token',
  })
  token_type: string;

  @ApiProperty({
    example: 86400,
    description: 'Tiempo de expiración en segundos',
  })
  expires_in: number;

  @ApiProperty({
    example: {
      id: 'uuid-string',
      nombre: 'Juan Pérez',
      email: 'juan.perez@example.com',
    },
    description: 'Información del usuario',
  })
  user: {
    id: string;
    nombre: string;
    email: string;
  };
}
