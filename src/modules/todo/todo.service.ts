import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoResponseDto,
  TodoListQueryDto,
  TodoListResponseDto,
  Priority,
} from './dto';

type TodoFromDb = {
  id: string;
  nombre: string;
  prioridad: string;
  finalizada: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  userId: string;
};

@Injectable()
export class TodoService {
  private readonly logger = new Logger(TodoService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, createTodoDto: CreateTodoDto): Promise<TodoResponseDto> {
    const { nombre, prioridad } = createTodoDto;

    const todo = await this.prismaService.todo.create({
      data: {
        nombre,
        prioridad,
        userId,
      },
    });

    this.logger.log(`Tarea creada: ${todo.id} por usuario: ${userId}`);

    return this.mapToResponseDto(todo);
  }

  async findAll(userId: string, query: TodoListQueryDto): Promise<TodoListResponseDto> {
    const { page = 1, limit = 10, prioridad, finalizada } = query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {
      userId,
      ...(prioridad && { prioridad }),
      ...(finalizada !== undefined && { finalizada }),
    };

    // Ejecutar consultas en paralelo
    const [todos, total] = await Promise.all([
      this.prismaService.todo.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fechaCreacion: 'desc' }],
      }),
      this.prismaService.todo.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: todos.map((todo: TodoFromDb) => this.mapToResponseDto(todo)),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(userId: string, id: string): Promise<TodoResponseDto> {
    const todo = await this.prismaService.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new NotFoundException(`Tarea con id ${id} no encontrada`);
    }

    // Verificar que la tarea pertenece al usuario
    if (todo.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para acceder a esta tarea');
    }

    return this.mapToResponseDto(todo);
  }

  async update(userId: string, id: string, updateTodoDto: UpdateTodoDto): Promise<TodoResponseDto> {
    // Verificar que la tarea existe y pertenece al usuario
    await this.findOne(userId, id);

    const updatedTodo = await this.prismaService.todo.update({
      where: { id },
      data: updateTodoDto,
    });

    this.logger.log(`Tarea actualizada: ${id} por usuario: ${userId}`);

    return this.mapToResponseDto(updatedTodo);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    // Verificar que la tarea existe y pertenece al usuario
    await this.findOne(userId, id);

    await this.prismaService.todo.delete({
      where: { id },
    });

    this.logger.log(`Tarea eliminada: ${id} por usuario: ${userId}`);

    return {
      message: 'Tarea eliminada exitosamente',
    };
  }

  private mapToResponseDto(todo: TodoFromDb): TodoResponseDto {
    return {
      id: todo.id,
      nombre: todo.nombre,
      prioridad: todo.prioridad as Priority,
      finalizada: todo.finalizada,
      fechaCreacion: todo.fechaCreacion,
      fechaActualizacion: todo.fechaActualizacion,
      userId: todo.userId,
    };
  }
}
