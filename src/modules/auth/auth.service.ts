import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@modules/prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from './dto';

/**
 * Servicio de autenticación que maneja el registro de usuarios, inicio de sesión y generación de tokens JWT.
 * Implementa hash seguro de contraseñas con bcrypt y autenticación basada en JWT.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 10;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema.
   * Valida la unicidad del email, hashea la contraseña con bcrypt, crea el registro del usuario
   * y genera el token JWT de autenticación.
   *
   * @param {RegisterDto} registerDto - Datos de registro del usuario (nombre, email, password)
   * @returns {Promise<AuthResponseDto>} Respuesta de autenticación con token JWT y datos del usuario
   * @throws {ConflictException} Si el email ya está registrado
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { nombre, email, password } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Crear usuario
    const user = await this.prismaService.user.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Usuario registrado: ${user.email}`);

    // Generar token
    return this.generateAuthResponse(user);
  }

  /**
   * Autentica un usuario existente.
   * Valida las credenciales usando comparación de contraseñas con bcrypt y genera el token JWT.
   *
   * @param {LoginDto} loginDto - Credenciales de inicio de sesión del usuario (email, password)
   * @returns {Promise<AuthResponseDto>} Respuesta de autenticación con token JWT y datos del usuario
   * @throws {UnauthorizedException} Si las credenciales son inválidas
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    this.logger.log(`Usuario autenticado: ${user.email}`);

    // Generar token
    const { password: _, ...userWithoutPassword } = user;
    return this.generateAuthResponse(userWithoutPassword);
  }

  /**
   * Obtiene la información del perfil del usuario autenticado.
   *
   * @param {string} userId - ID del usuario del payload del token JWT
   * @returns {Promise<UserResponseDto>} Datos del perfil del usuario (sin contraseña)
   * @throws {UnauthorizedException} Si el usuario no se encuentra
   */
  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Genera la respuesta de autenticación con JWT.
   * Crea un token JWT firmado con el payload del usuario y calcula el tiempo de expiración.
   *
   * @param {object} user - Datos del usuario a incluir en el payload del JWT
   * @param {string} user.id - ID del usuario
   * @param {string} user.nombre - Nombre del usuario
   * @param {string} user.email - Email del usuario
   * @returns {AuthResponseDto} Respuesta completa de autenticación con token y metadatos
   * @private
   */
  private generateAuthResponse(user: {
    id: string;
    nombre: string;
    email: string;
  }): AuthResponseDto {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.parseJwtExpiration(
      this.configService.get<string>('JWT_EXPIRATION', '24h'),
    );

    return {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: expiresIn,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    };
  }

  /**
   * Convierte el string de expiración del JWT a segundos.
   * Soporta unidades de tiempo: s (segundos), m (minutos), h (horas), d (días).
   *
   * @param {string} expiration - String de tiempo de expiración (ej: '24h', '1d', '30m')
   * @returns {number} Tiempo de expiración en segundos
   * @private
   */
  private parseJwtExpiration(expiration: string): number {
    const timeUnit = expiration.slice(-1);
    const timeValue = parseInt(expiration.slice(0, -1));

    switch (timeUnit) {
      case 's':
        return timeValue;
      case 'm':
        return timeValue * 60;
      case 'h':
        return timeValue * 60 * 60;
      case 'd':
        return timeValue * 24 * 60 * 60;
      default:
        return 86400; // 24 horas por defecto
    }
  }
}
