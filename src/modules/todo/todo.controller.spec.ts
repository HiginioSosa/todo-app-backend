import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { CreateTodoDto, UpdateTodoDto, Priority } from './dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TodoController', () => {
  let controller: TodoController;
  let todoService: TodoService;

  const mockUser = { id: 'user-123' };

  const mockTodo = {
    id: 'todo-1',
    nombre: 'Test Todo',
    prioridad: 'MEDIA' as Priority,
    finalizada: false,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    userId: mockUser.id,
  };

  const mockTodoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    todoService = module.get<TodoService>(TodoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should return todo statistics for user', async () => {
      const mockStats = {
        total: 10,
        completadas: 5,
        pendientes: 5,
        alta: 2,
        media: 3,
        baja: 5,
      };

      mockTodoService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats(mockUser);

      expect(result).toEqual(mockStats);
      expect(todoService.getStats).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return zero stats for user with no todos', async () => {
      const emptyStats = {
        total: 0,
        completadas: 0,
        pendientes: 0,
        alta: 0,
        media: 0,
        baja: 0,
      };

      mockTodoService.getStats.mockResolvedValue(emptyStats);

      const result = await controller.getStats(mockUser);

      expect(result.total).toBe(0);
      expect(result.completadas).toBe(0);
      expect(result.pendientes).toBe(0);
    });
  });

  describe('create', () => {
    const createTodoDto: CreateTodoDto = {
      nombre: 'New Todo',
      prioridad: Priority.MEDIA,
    };

    it('should create a new todo', async () => {
      mockTodoService.create.mockResolvedValue(mockTodo);

      const result = await controller.create(mockUser, createTodoDto);

      expect(result).toEqual(mockTodo);
      expect(todoService.create).toHaveBeenCalledWith(mockUser.id, createTodoDto);
    });

    it('should create todo with correct user id', async () => {
      mockTodoService.create.mockResolvedValue(mockTodo);

      await controller.create(mockUser, createTodoDto);

      expect(todoService.create).toHaveBeenCalledWith('user-123', createTodoDto);
    });

    it('should return created todo with all properties', async () => {
      mockTodoService.create.mockResolvedValue(mockTodo);

      const result = await controller.create(mockUser, createTodoDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('nombre');
      expect(result).toHaveProperty('prioridad');
      expect(result).toHaveProperty('finalizada');
      expect(result).toHaveProperty('userId');
    });
  });

  describe('findAll', () => {
    const queryDto = {
      page: 1,
      limit: 10,
    };

    it('should return paginated todos', async () => {
      const mockResponse = {
        data: [mockTodo],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockTodoService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockUser, queryDto);

      expect(result).toEqual(mockResponse);
      expect(todoService.findAll).toHaveBeenCalledWith(mockUser.id, queryDto);
    });

    it('should return empty array when no todos exist', async () => {
      const emptyResponse = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };

      mockTodoService.findAll.mockResolvedValue(emptyResponse);

      const result = await controller.findAll(mockUser, queryDto);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should handle pagination parameters', async () => {
      const customQuery = { page: 2, limit: 5 };
      mockTodoService.findAll.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 2, limit: 5, totalPages: 0 },
      });

      await controller.findAll(mockUser, customQuery);

      expect(todoService.findAll).toHaveBeenCalledWith(mockUser.id, customQuery);
    });
  });

  describe('findOne', () => {
    it('should return a todo by id', async () => {
      mockTodoService.findOne.mockResolvedValue(mockTodo);

      const result = await controller.findOne(mockUser, 'todo-1');

      expect(result).toEqual(mockTodo);
      expect(todoService.findOne).toHaveBeenCalledWith(mockUser.id, 'todo-1');
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockTodoService.findOne.mockRejectedValue(new NotFoundException('Tarea no encontrada'));

      await expect(controller.findOne(mockUser, 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if todo belongs to another user', async () => {
      mockTodoService.findOne.mockRejectedValue(
        new ForbiddenException('No tienes permiso para acceder a esta tarea'),
      );

      await expect(controller.findOne(mockUser, 'todo-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    const updateTodoDto: UpdateTodoDto = {
      nombre: 'Updated Todo',
      finalizada: true,
    };

    it('should update a todo successfully', async () => {
      const updatedTodo = { ...mockTodo, ...updateTodoDto };
      mockTodoService.update.mockResolvedValue(updatedTodo);

      const result = await controller.update(mockUser, 'todo-1', updateTodoDto);

      expect(result).toEqual(updatedTodo);
      expect(todoService.update).toHaveBeenCalledWith(mockUser.id, 'todo-1', updateTodoDto);
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockTodoService.update.mockRejectedValue(new NotFoundException('Tarea no encontrada'));

      await expect(controller.update(mockUser, 'invalid-id', updateTodoDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if todo belongs to another user', async () => {
      mockTodoService.update.mockRejectedValue(
        new ForbiddenException('No tienes permiso para actualizar esta tarea'),
      );

      await expect(controller.update(mockUser, 'todo-1', updateTodoDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { finalizada: true };
      const updatedTodo = { ...mockTodo, finalizada: true };
      mockTodoService.update.mockResolvedValue(updatedTodo);

      const result = await controller.update(mockUser, 'todo-1', partialUpdate);

      expect(result.finalizada).toBe(true);
      expect(todoService.update).toHaveBeenCalledWith(mockUser.id, 'todo-1', partialUpdate);
    });
  });

  describe('remove', () => {
    it('should delete a todo successfully', async () => {
      const mockResponse = { message: 'Tarea eliminada exitosamente' };
      mockTodoService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(mockUser, 'todo-1');

      expect(result).toEqual(mockResponse);
      expect(todoService.remove).toHaveBeenCalledWith(mockUser.id, 'todo-1');
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockTodoService.remove.mockRejectedValue(new NotFoundException('Tarea no encontrada'));

      await expect(controller.remove(mockUser, 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if todo belongs to another user', async () => {
      mockTodoService.remove.mockRejectedValue(
        new ForbiddenException('No tienes permiso para eliminar esta tarea'),
      );

      await expect(controller.remove(mockUser, 'todo-1')).rejects.toThrow(ForbiddenException);
    });

    it('should return success message after deletion', async () => {
      const mockResponse = { message: 'Tarea eliminada exitosamente' };
      mockTodoService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(mockUser, 'todo-1');

      expect(result.message).toBe('Tarea eliminada exitosamente');
    });
  });
});
