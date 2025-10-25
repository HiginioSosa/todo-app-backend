import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Priority } from './create-todo.dto';

/**
 * Data Transfer Object for todo list query parameters.
 * Supports pagination and filtering by priority and completion status.
 */
export class TodoListQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Cantidad de elementos por página',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'MEDIA',
    description: 'Filtrar por prioridad',
    enum: Priority,
  })
  @IsOptional()
  @IsEnum(Priority)
  prioridad?: Priority;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de finalización',
    type: Boolean,
    example: false,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (typeof value === 'boolean') return value;
    return undefined;
  })
  @IsOptional()
  @IsBoolean()
  finalizada?: boolean;
}
