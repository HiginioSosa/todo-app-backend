import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, MinLength, MaxLength } from 'class-validator';

export enum Priority {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

export class CreateTodoDto {
  @ApiProperty({
    example: 'Completar el proyecto de NestJS',
    description: 'Nombre de la tarea',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  nombre: string;

  @ApiProperty({
    example: 'MEDIA',
    description: 'Prioridad de la tarea',
    enum: Priority,
    default: Priority.MEDIA,
  })
  @IsEnum(Priority)
  @IsNotEmpty()
  prioridad: Priority;
}
