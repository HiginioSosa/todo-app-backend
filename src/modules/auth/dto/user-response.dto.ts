import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for user profile responses.
 * Excludes sensitive information like password.
 */
export class UserResponseDto {
  @ApiProperty({
    example: 'uuid-string',
    description: 'ID único del usuario',
  })
  id: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
  })
  nombre: string;

  @ApiProperty({
    example: 'juan.perez@example.com',
    description: 'Correo electrónico del usuario',
  })
  email: string;

  @ApiProperty({
    example: '2024-10-24T15:30:00.000Z',
    description: 'Fecha de creación del usuario',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-10-24T15:30:00.000Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;
}
