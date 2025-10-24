import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@modules/prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 10;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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
