import { ApiProperty } from '@nestjs/swagger';
import { TodoResponseDto } from './todo-response.dto';

/**
 * Data Transfer Object for paginated todo list responses.
 * Includes data array and pagination metadata.
 */
export class TodoListResponseDto {
  @ApiProperty({
    type: [TodoResponseDto],
    description: 'Lista de tareas',
  })
  data: TodoResponseDto[];

  @ApiProperty({
    example: {
      total: 50,
      page: 1,
      limit: 10,
      totalPages: 5,
    },
    description: 'Metadatos de paginación',
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
