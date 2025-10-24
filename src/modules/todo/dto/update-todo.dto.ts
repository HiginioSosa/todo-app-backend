import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Priority } from './create-todo.dto';

export class UpdateTodoDto {
  @ApiPropertyOptional({
    example: 'Completar el proyecto de NestJS - Actualizado',
    description: 'Nombre de la tarea',
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nombre?: string;

  @ApiPropertyOptional({
    example: 'ALTA',
    description: 'Prioridad de la tarea',
    enum: Priority,
  })
  @IsOptional()
  @IsEnum(Priority)
  prioridad?: Priority;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado de finalización de la tarea',
  })
  @IsOptional()
  @IsBoolean()
  finalizada?: boolean;
}
