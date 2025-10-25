import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Priority } from './create-todo.dto';

/**
 * Data Transfer Object for updating a todo.
 * All fields are optional for partial updates.
 */
export class UpdateTodoDto {
  @ApiPropertyOptional({
    example: 'Completar el proyecto de NestJS - Actualizado',
    description: 'Nombre de la tarea',
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(1, { message: 'El nombre debe tener al menos 1 carácter' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre?: string;

  @ApiPropertyOptional({
    example: 'ALTA',
    description: 'Prioridad de la tarea',
    enum: Priority,
  })
  @IsOptional()
  @IsEnum(Priority, { message: 'La prioridad debe ser BAJA, MEDIA o ALTA' })
  prioridad?: Priority;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado de finalización de la tarea',
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo finalizada debe ser un valor booleano' })
  @Type(() => Boolean)
  finalizada?: boolean;
}
