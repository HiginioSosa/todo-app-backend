import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Priority } from './dto';

describe('TodoService', () => {
  let service: TodoService;
  let prismaService: PrismaService;

  const mockUserId = 'user-123';
  const otherUserId = 'user-456';

  const mockTodo = {
    id: 'todo-1',
    nombre: 'Test Todo',
    prioridad: 'MEDIA',
    finalizada: false,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    userId: mockUserId,
  };

  const mockPrismaService = {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTodoDto = {
      nombre: 'New Todo',
      prioridad: Priority.MEDIA,
    };

    it('should create a todo successfully', async () => {
      mockPrismaService.todo.create.mockResolvedValue(mockTodo);

      const result = await service.create(mockUserId, createTodoDto);

      expect(result).toEqual(mockTodo);
      expect(prismaService.todo.create).toHaveBeenCalledWith({
        data: {
          nombre: createTodoDto.nombre,
          prioridad: createTodoDto.prioridad,
          userId: mockUserId,
        },
      });
    });
  });

  describe('findAll', () => {
    const queryDto = {
      page: 1,
      limit: 10,
    };

    it('should return paginated todos', async () => {
      mockPrismaService.todo.findMany.mockResolvedValue([mockTodo]);
      mockPrismaService.todo.count.mockResolvedValue(1);

      const result = await service.findAll(mockUserId, queryDto);

      expect(result.data).toEqual([mockTodo]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(prismaService.todo.findMany).toHaveBeenCalled();
      expect(prismaService.todo.count).toHaveBeenCalled();
    });

    it('should filter by finalizada status', async () => {
      const queryWithFilter = { ...queryDto, finalizada: true };
      mockPrismaService.todo.findMany.mockResolvedValue([]);
      mockPrismaService.todo.count.mockResolvedValue(0);

      await service.findAll(mockUserId, queryWithFilter);

      expect(prismaService.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUserId,
            finalizada: true,
          }),
        }),
      );
    });

    it('should filter by prioridad', async () => {
      const queryWithFilter = { ...queryDto, prioridad: Priority.ALTA };
      mockPrismaService.todo.findMany.mockResolvedValue([]);
      mockPrismaService.todo.count.mockResolvedValue(0);

      await service.findAll(mockUserId, queryWithFilter);

      expect(prismaService.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUserId,
            prioridad: Priority.ALTA,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a todo by id', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);

      const result = await service.findOne(mockUserId, 'todo-1');

      expect(result).toEqual(mockTodo);
      expect(prismaService.todo.findUnique).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
      });
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(service.findOne(mockUserId, 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if todo belongs to another user', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue({
        ...mockTodo,
        userId: otherUserId,
      });

      await expect(service.findOne(mockUserId, 'todo-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    const updateDto = {
      nombre: 'Updated Todo',
      finalizada: true,
    };

    it('should update a todo successfully', async () => {
      const updatedTodo = { ...mockTodo, ...updateDto };
      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);
      mockPrismaService.todo.update.mockResolvedValue(updatedTodo);

      const result = await service.update(mockUserId, 'todo-1', updateDto);

      expect(result).toEqual(updatedTodo);
      expect(prismaService.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(service.update(mockUserId, 'invalid-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if todo belongs to another user', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue({
        ...mockTodo,
        userId: otherUserId,
      });

      await expect(service.update(mockUserId, 'todo-1', updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a todo successfully', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);
      mockPrismaService.todo.delete.mockResolvedValue(mockTodo);

      await service.remove(mockUserId, 'todo-1');

      expect(prismaService.todo.delete).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
      });
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(service.remove(mockUserId, 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if todo belongs to another user', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue({
        ...mockTodo,
        userId: otherUserId,
      });

      await expect(service.remove(mockUserId, 'todo-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStats', () => {
    it('should return todo statistics', async () => {
      mockPrismaService.todo.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(5) // completadas
        .mockResolvedValueOnce(5) // pendientes
        .mockResolvedValueOnce(2) // alta prioridad
        .mockResolvedValueOnce(3) // media prioridad
        .mockResolvedValueOnce(5); // baja prioridad

      const result = await service.getStats(mockUserId);

      expect(result.total).toBe(10);
      expect(result.completadas).toBe(5);
      expect(result.pendientes).toBe(5);
      expect(result.alta).toBe(2);
      expect(result.media).toBe(3);
      expect(result.baja).toBe(5);
    });
  });
});
