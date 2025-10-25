import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Enum for todo priority levels.
 */
export enum Priority {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

/**
 * Data Transfer Object for creating a new todo.
 * Validates task name and priority.
 */
export class CreateTodoDto {
  @ApiProperty({
    example: 'Completar el proyecto de NestJS',
    description: 'Nombre de la tarea',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la tarea es obligatorio' })
  @MinLength(1, { message: 'El nombre debe tener al menos 1 carácter' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @ApiProperty({
    example: 'MEDIA',
    description: 'Prioridad de la tarea',
    enum: Priority,
    default: Priority.MEDIA,
  })
  @IsEnum(Priority, { message: 'La prioridad debe ser BAJA, MEDIA o ALTA' })
  @IsNotEmpty({ message: 'La prioridad es obligatoria' })
  prioridad: Priority;
}
