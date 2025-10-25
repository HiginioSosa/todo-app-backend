import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'user-123',
    nombre: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
    };

    const userWithoutPassword = {
      id: mockUser.id,
      nombre: mockUser.nombre,
      email: mockUser.email,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
    };

    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should validate and return user for valid payload', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);

      const result = await strategy.validate(payload);

      expect(result).toEqual(userWithoutPassword);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: payload.sub },
        select: {
          id: true,
          nombre: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: payload.sub },
        select: {
          id: true,
          nombre: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should not include password in returned user data', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);

      const result = await strategy.validate(payload);

      expect(result).not.toHaveProperty('password');
    });

    it('should extract user id from sub claim', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);

      await strategy.validate(payload);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          nombre: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });
});
