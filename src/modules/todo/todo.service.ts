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
import { TodoStatsResponseDto } from './dto/todo-stats-response.dto';

/**
 * Definición de tipo para la entidad Todo de la base de datos.
 * @private
 */
type TodoFromDb = {
  id: string;
  nombre: string;
  prioridad: string;
  finalizada: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  userId: string;
};

/**
 * Servicio que maneja las operaciones CRUD de tareas con validación de propiedad.
 * Todas las operaciones verifican que el usuario sea dueño de la tarea antes de realizar acciones.
 */
@Injectable()
export class TodoService {
  private readonly logger = new Logger(TodoService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Crea una nueva tarea para el usuario autenticado.
   *
   * @param {string} userId - ID del usuario del token JWT
   * @param {CreateTodoDto} createTodoDto - Datos de creación de la tarea
   * @returns {Promise<TodoResponseDto>} Tarea creada
   */
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

  /**
   * Obtiene todas las tareas del usuario autenticado con paginación y filtros.
   *
   * @param {string} userId - ID del usuario del token JWT
   * @param {TodoListQueryDto} query - Parámetros de consulta (page, limit, prioridad, finalizada)
   * @returns {Promise<TodoListResponseDto>} Lista paginada de tareas con metadatos
   */
  async findAll(userId: string, query: TodoListQueryDto): Promise<TodoListResponseDto> {
    const { page = 1, limit = 10, prioridad, finalizada } = query;
    const skip = (page - 1) * limit;

    // Construir filtros
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      userId,
    };

    if (prioridad) {
      where.prioridad = prioridad;
    }

    if (finalizada !== undefined) {
      where.finalizada = finalizada;
    }

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

  /**
   * Obtiene una tarea única por ID con validación de propiedad.
   *
   * @param {string} userId - ID del usuario del token JWT
   * @param {string} id - ID de la tarea
   * @returns {Promise<TodoResponseDto>} Datos de la tarea
   * @throws {NotFoundException} Si la tarea no se encuentra
   * @throws {ForbiddenException} Si el usuario no es dueño de la tarea
   */
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

  /**
   * Actualiza una tarea con validación de propiedad.
   *
   * @param {string} userId - ID del usuario del token JWT
   * @param {string} id - ID de la tarea
   * @param {UpdateTodoDto} updateTodoDto - Datos de actualización (parcial)
   * @returns {Promise<TodoResponseDto>} Tarea actualizada
   * @throws {NotFoundException} Si la tarea no se encuentra
   * @throws {ForbiddenException} Si el usuario no es dueño de la tarea
   */
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

  /**
   * Elimina una tarea con validación de propiedad.
   *
   * @param {string} userId - ID del usuario del token JWT
   * @param {string} id - ID de la tarea
   * @returns {Promise<{message: string}>} Mensaje de confirmación de eliminación
   * @throws {NotFoundException} Si la tarea no se encuentra
   * @throws {ForbiddenException} Si el usuario no es dueño de la tarea
   */
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

  /**
   * Obtiene estadísticas agregadas de todas las tareas del usuario.
   * Realiza conteos optimizados en la base de datos sin traer todos los registros.
   *
   * @param {string} userId - ID del usuario del token JWT
   * @returns {Promise<TodoStatsResponseDto>} Estadísticas de tareas del usuario
   */
  async getStats(userId: string): Promise<TodoStatsResponseDto> {
    // Ejecutar todos los conteos en paralelo para mejor rendimiento
    const [total, pendientes, completadas, alta, media, baja] = await Promise.all([
      this.prismaService.todo.count({ where: { userId } }),
      this.prismaService.todo.count({ where: { userId, finalizada: false } }),
      this.prismaService.todo.count({ where: { userId, finalizada: true } }),
      this.prismaService.todo.count({ where: { userId, prioridad: 'ALTA' } }),
      this.prismaService.todo.count({ where: { userId, prioridad: 'MEDIA' } }),
      this.prismaService.todo.count({ where: { userId, prioridad: 'BAJA' } }),
    ]);

    this.logger.log(`Estadísticas obtenidas para usuario: ${userId}`);

    return {
      total,
      pendientes,
      completadas,
      alta,
      media,
      baja,
    };
  }

  /**
   * Mapea la entidad de tarea de base de datos al DTO de respuesta.
   *
   * @param {TodoFromDb} todo - Entidad de tarea de la base de datos
   * @returns {TodoResponseDto} Respuesta de tarea formateada
   * @private
   */
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
