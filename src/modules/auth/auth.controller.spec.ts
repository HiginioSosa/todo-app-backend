import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getMe: jest.fn(),
  };

  const mockAuthResponse = {
    access_token: 'mock-jwt-token',
    user: {
      id: 'user-123',
      nombre: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockUserResponse = {
    id: 'user-123',
    nombre: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      nombre: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should register a new user successfully', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException('El correo electrónico ya está registrado'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should return access_token and user data', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('nombre');
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully with valid credentials', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Credenciales inválidas'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should return JWT token on successful login', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe(loginDto.email);
    });
  });

  describe('getMe', () => {
    const mockUser = { id: 'user-123' };

    it('should return current user profile', async () => {
      mockAuthService.getMe.mockResolvedValue(mockUserResponse);

      const result = await controller.getMe(mockUser);

      expect(result).toEqual(mockUserResponse);
      expect(authService.getMe).toHaveBeenCalledWith(mockUser.id);
      expect(authService.getMe).toHaveBeenCalledTimes(1);
    });

    it('should return user data without password', async () => {
      mockAuthService.getMe.mockResolvedValue(mockUserResponse);

      const result = await controller.getMe(mockUser);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('nombre');
    });

    it('should call getMe with correct user id', async () => {
      mockAuthService.getMe.mockResolvedValue(mockUserResponse);

      await controller.getMe(mockUser);

      expect(authService.getMe).toHaveBeenCalledWith('user-123');
    });
  });
});
