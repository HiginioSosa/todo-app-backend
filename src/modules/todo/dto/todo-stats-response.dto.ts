import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object para la respuesta de estadísticas de tareas.
 * Contiene conteos agregados de todas las tareas del usuario.
 */
export class TodoStatsResponseDto {
  @ApiProperty({
    example: 15,
    description: 'Total de tareas del usuario',
  })
  total: number;

  @ApiProperty({
    example: 8,
    description: 'Cantidad de tareas pendientes (no finalizadas)',
  })
  pendientes: number;

  @ApiProperty({
    example: 7,
    description: 'Cantidad de tareas completadas (finalizadas)',
  })
  completadas: number;

  @ApiProperty({
    example: 5,
    description: 'Cantidad de tareas con prioridad ALTA',
  })
  alta: number;

  @ApiProperty({
    example: 6,
    description: 'Cantidad de tareas con prioridad MEDIA',
  })
  media: number;

  @ApiProperty({
    example: 4,
    description: 'Cantidad de tareas con prioridad BAJA',
  })
  baja: number;
}
