import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public, CurrentUser } from '@common/decorators';

/**
 * Controlador de autenticación que maneja el registro de usuarios, inicio de sesión y endpoints de perfil.
 * Implementa limitación de tasa en rutas sensibles de autenticación.
 */
@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registra una nueva cuenta de usuario.
   * Endpoint público con limitación de tasa estricta (3 peticiones por minuto).
   *
   * @param {RegisterDto} registerDto - Información de registro del usuario
   * @returns {Promise<AuthResponseDto>} Token JWT y perfil del usuario
   */
  @Public()
  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // Máximo 3 registros por minuto
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El correo electrónico ya está registrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Demasiados intentos de registro. Intenta más tarde.',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Autentica un usuario con email y contraseña.
   * Endpoint público con limitación de tasa (5 peticiones por minuto) para prevenir ataques de fuerza bruta.
   *
   * @param {LoginDto} loginDto - Credenciales del usuario
   * @returns {Promise<AuthResponseDto>} Token JWT y perfil del usuario
   */
  @Public()
  @Post('login')
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // Máximo 5 intentos de login por minuto
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inicio de sesión exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Demasiados intentos de inicio de sesión. Intenta más tarde.',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   * Endpoint protegido que requiere un token JWT válido.
   *
   * @param {object} user - Usuario actual del token JWT (inyectado por el decorador @CurrentUser)
   * @param {string} user.id - ID del usuario del payload del token
   * @returns {Promise<UserResponseDto>} Información del perfil del usuario
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener información del usuario autenticado' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Información del usuario',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado',
  })
  async getMe(@CurrentUser() user: { id: string }): Promise<UserResponseDto> {
    return this.authService.getMe(user.id);
  }
}
