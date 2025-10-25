import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/modules/prisma/prisma.service';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Limpiar base de datos de test
    await prismaService.todo.deleteMany();
    await prismaService.user.deleteMany();
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    const validRegisterDto = {
      nombre: 'Test User E2E',
      email: `teste2e-${Date.now()}@example.com`,
      password: 'password123',
    };

    beforeEach(async () => {
      // Limpiar datos antes de cada test
      await prismaService.user.deleteMany({
        where: { email: { contains: 'teste2e' } },
      });
    });

    afterEach(async () => {
      // Limpiar usuario creado en el test
      await prismaService.user.deleteMany({
        where: { email: { contains: 'teste2e' } },
      });
    });

    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(validRegisterDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('email', validRegisterDto.email);
          expect(res.body.user).toHaveProperty('nombre', validRegisterDto.nombre);
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validRegisterDto,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validRegisterDto,
          password: '12345',
        })
        .expect(400);
    });

    it('should fail when email already exists', async () => {
      const duplicateEmail = {
        nombre: 'Test Duplicate',
        email: `duplicate-${Date.now()}@example.com`,
        password: 'password123',
      };

      // Registrar usuario primero
      await request(app.getHttpServer()).post('/auth/register').send(duplicateEmail).expect(201);

      // Intentar registrar de nuevo con mismo email
      await request(app.getHttpServer()).post('/auth/register').send(duplicateEmail).expect(409);

      // Limpiar
      await prismaService.user.deleteMany({ where: { email: duplicateEmail.email } });
    });

    it('should fail when required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    const testUser = {
      nombre: 'Login Test User',
      email: `logintest-${Date.now()}@example.com`,
      password: 'password123',
    };

    beforeAll(async () => {
      // Limpiar antes
      await prismaService.user.deleteMany({ where: { email: { contains: 'logintest' } } });
      // Crear usuario para tests de login
      await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(201);
    });

    afterAll(async () => {
      // Limpiar usuario de test
      await prismaService.user.deleteMany({
        where: { email: { contains: 'logintest' } },
      });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
        });
    });

    it('should fail with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should fail when credentials are missing', () => {
      return request(app.getHttpServer()).post('/auth/login').send({}).expect(400);
    });
  });

  describe('/auth/me (GET)', () => {
    let authToken: string;
    const testUser = {
      nombre: 'Me Test User',
      email: `metest-${Date.now()}@example.com`,
      password: 'password123',
    };

    beforeAll(async () => {
      // Limpiar antes
      await prismaService.user.deleteMany({ where: { email: { contains: 'metest' } } });

      // Registrar y obtener token
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      authToken = response.body.access_token;
    });

    afterAll(async () => {
      await prismaService.user.deleteMany({
        where: { email: { contains: 'metest' } },
      });
    });

    it('should get current user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', testUser.email);
          expect(res.body).toHaveProperty('nombre', testUser.nombre);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail without authorization header', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should fail with malformed authorization header', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });
});
