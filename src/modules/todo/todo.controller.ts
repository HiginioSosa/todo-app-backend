import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TodoService } from './todo.service';
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoResponseDto,
  TodoListQueryDto,
  TodoListResponseDto,
} from './dto';
import { TodoStatsResponseDto } from './dto/todo-stats-response.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators';

/**
 * Controlador de tareas que maneja los endpoints de gestión de tareas.
 * Todos los endpoints requieren autenticación JWT y verifican la propiedad de la tarea.
 */
@ApiTags('Tareas (To-Do)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  /**
   * Obtiene estadísticas agregadas de todas las tareas del usuario.
   * Retorna conteos optimizados sin traer todos los registros.
   *
   * @param {object} user - Usuario actual del token JWT
   * @param {string} user.id - ID del usuario
   * @returns {Promise<TodoStatsResponseDto>} Estadísticas de tareas
   */
  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de tareas del usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas obtenidas exitosamente',
    type: TodoStatsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  async getStats(@CurrentUser() user: { id: string }): Promise<TodoStatsResponseDto> {
    return this.todoService.getStats(user.id);
  }

  /**
   * Crea una nueva tarea para el usuario autenticado.
   *
   * @param {object} user - Usuario actual del token JWT
   * @param {string} user.id - ID del usuario
   * @param {CreateTodoDto} createTodoDto - Datos de creación de la tarea
   * @returns {Promise<TodoResponseDto>} Tarea creada
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiBody({ type: CreateTodoDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tarea creada exitosamente',
    type: TodoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async create(
    @CurrentUser() user: { id: string },
    @Body() createTodoDto: CreateTodoDto,
  ): Promise<TodoResponseDto> {
    return this.todoService.create(user.id, createTodoDto);
  }

  /**
   * Obtiene todas las tareas del usuario autenticado con paginación y filtros.
   *
   * @param {object} user - Usuario actual del token JWT
   * @param {string} user.id - ID del usuario
   * @param {TodoListQueryDto} query - Parámetros de consulta para paginación y filtrado
   * @returns {Promise<TodoListResponseDto>} Lista paginada de tareas
   */
  @Get('list')
  @ApiOperation({ summary: 'Obtener lista de tareas del usuario autenticado' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de tareas obtenida exitosamente',
    type: TodoListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  async findAll(
    @CurrentUser() user: { id: string },
    @Query() query: TodoListQueryDto,
  ): Promise<TodoListResponseDto> {
    return this.todoService.findAll(user.id, query);
  }

  /**
   * Obtiene una tarea específica por ID con verificación de propiedad.
   *
   * @param {object} user - Usuario actual del token JWT
   * @param {string} user.id - ID del usuario
   * @param {string} id - ID de la tarea
   * @returns {Promise<TodoResponseDto>} Datos de la tarea
   */
  @Get('list/:id')
  @ApiOperation({ summary: 'Obtener una tarea específica por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tarea obtenida exitosamente',
    type: TodoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tarea no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permiso para acceder a esta tarea',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  async findOne(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<TodoResponseDto> {
    return this.todoService.findOne(user.id, id);
  }

  /**
   * Actualiza una tarea con verificación de propiedad.
   *
   * @param {object} user - Usuario actual del token JWT
   * @param {string} user.id - ID del usuario
   * @param {string} id - ID de la tarea
   * @param {UpdateTodoDto} updateTodoDto - Datos de actualización (parcial)
   * @returns {Promise<TodoResponseDto>} Tarea actualizada
   */
  @Patch('update/:id')
  @ApiOperation({ summary: 'Actualizar una tarea existente' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea',
    type: String,
  })
  @ApiBody({ type: UpdateTodoDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tarea actualizada exitosamente',
    type: TodoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tarea no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permiso para actualizar esta tarea',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<TodoResponseDto> {
    return this.todoService.update(user.id, id, updateTodoDto);
  }

  /**
   * Elimina una tarea con verificación de propiedad.
   *
   * @param {object} user - Usuario actual del token JWT
   * @param {string} user.id - ID del usuario
   * @param {string} id - ID de la tarea
   * @returns {Promise<{message: string}>} Confirmación de eliminación
   */
  @Delete('list/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una tarea por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tarea eliminada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Tarea eliminada exitosamente',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tarea no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No tienes permiso para eliminar esta tarea',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  async remove(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.todoService.remove(user.id, id);
  }
}
