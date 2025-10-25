import { ApiProperty } from '@nestjs/swagger';
import { Priority } from './create-todo.dto';

/**
 * Data Transfer Object for todo responses.
 * Represents a complete todo entity.
 */
export class TodoResponseDto {
  @ApiProperty({
    example: 'uuid-string',
    description: 'ID único de la tarea',
  })
  id: string;

  @ApiProperty({
    example: 'Completar el proyecto de NestJS',
    description: 'Nombre de la tarea',
  })
  nombre: string;

  @ApiProperty({
    example: 'MEDIA',
    description: 'Prioridad de la tarea',
    enum: Priority,
  })
  prioridad: Priority;

  @ApiProperty({
    example: false,
    description: 'Estado de finalización de la tarea',
  })
  finalizada: boolean;

  @ApiProperty({
    example: '2024-10-24T15:30:00.000Z',
    description: 'Fecha de creación de la tarea',
  })
  fechaCreacion: Date;

  @ApiProperty({
    example: '2024-10-24T15:30:00.000Z',
    description: 'Fecha de última actualización',
  })
  fechaActualizacion: Date;

  @ApiProperty({
    example: 'uuid-string',
    description: 'ID del usuario propietario',
  })
  userId: string;
}
