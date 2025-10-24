import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Priority } from './create-todo.dto';

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
    example: false,
    description: 'Filtrar por estado de finalización',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  finalizada?: boolean;
}
