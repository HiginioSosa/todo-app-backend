import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/modules/prisma/prisma.service';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('Todo (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let authToken: string;
  let userId: string;

  const testUser = {
    nombre: 'Todo Test User',
    email: `todotest-${Date.now()}@example.com`, // Email único por ejecución
    password: 'password123',
  };

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

    // Limpiar datos previos
    await prismaService.todo.deleteMany();
    await prismaService.user.deleteMany();

    // Registrar usuario y obtener token
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    authToken = response.body.access_token;
    userId = response.body.user.id;
  });

  afterAll(async () => {
    // Limpiar base de datos
    await prismaService.todo.deleteMany();
    await prismaService.user.deleteMany();
    await app.close();
  });

  describe('/todo/stats (GET)', () => {
    beforeEach(async () => {
      // Crear algunas tareas de prueba
      await prismaService.todo.createMany({
        data: [
          {
            nombre: 'Tarea 1',
            prioridad: 'ALTA',
            finalizada: true,
            userId: userId,
          },
          {
            nombre: 'Tarea 2',
            prioridad: 'MEDIA',
            finalizada: false,
            userId: userId,
          },
          {
            nombre: 'Tarea 3',
            prioridad: 'BAJA',
            finalizada: false,
            userId: userId,
          },
        ],
      });
    });

    afterEach(async () => {
      await prismaService.todo.deleteMany({ where: { userId } });
    });

    it('should get todo statistics', () => {
      return request(app.getHttpServer())
        .get('/todo/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('completadas');
          expect(res.body).toHaveProperty('pendientes');
          expect(res.body).toHaveProperty('alta');
          expect(res.body).toHaveProperty('media');
          expect(res.body).toHaveProperty('baja');
          expect(res.body.total).toBe(3);
          expect(res.body.completadas).toBe(1);
          expect(res.body.pendientes).toBe(2);
        });
    });

    it('should fail without authorization', () => {
      return request(app.getHttpServer()).get('/todo/stats').expect(401);
    });
  });

  describe('/todo/create (POST)', () => {
    afterEach(async () => {
      await prismaService.todo.deleteMany({ where: { userId } });
    });

    it('should create a new todo', () => {
      return request(app.getHttpServer())
        .post('/todo/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Nueva Tarea E2E',
          prioridad: 'MEDIA',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('nombre', 'Nueva Tarea E2E');
          expect(res.body).toHaveProperty('prioridad', 'MEDIA');
          expect(res.body).toHaveProperty('finalizada', false);
          expect(res.body).toHaveProperty('userId', userId);
        });
    });

    it('should fail with invalid priority', () => {
      return request(app.getHttpServer())
        .post('/todo/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Tarea Inválida',
          prioridad: 'INVALID',
        })
        .expect(400);
    });

    it('should fail without required fields', () => {
      return request(app.getHttpServer())
        .post('/todo/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prioridad: 'MEDIA',
        })
        .expect(400);
    });

    it('should fail without authorization', () => {
      return request(app.getHttpServer())
        .post('/todo/create')
        .send({
          nombre: 'Tarea Sin Auth',
          prioridad: 'MEDIA',
        })
        .expect(401);
    });
  });

  describe('/todo/list (GET)', () => {
    beforeAll(async () => {
      // Crear tareas para paginación
      const todos = Array.from({ length: 15 }, (_, i) => ({
        nombre: `Tarea ${i + 1}`,
        prioridad: (i % 3 === 0 ? 'ALTA' : i % 3 === 1 ? 'MEDIA' : 'BAJA') as
          | 'ALTA'
          | 'MEDIA'
          | 'BAJA',
        finalizada: i % 2 === 0,
        userId: userId,
      }));

      await prismaService.todo.createMany({ data: todos });
    });

    afterAll(async () => {
      await prismaService.todo.deleteMany({ where: { userId } });
    });

    it('should get paginated todos', () => {
      return request(app.getHttpServer())
        .get('/todo/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('page', 1);
          expect(res.body.meta).toHaveProperty('limit', 10);
          expect(res.body.data.length).toBeLessThanOrEqual(10);
        });
    });

    it('should filter by finalizada status', () => {
      return request(app.getHttpServer())
        .get('/todo/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ finalizada: true })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((todo: any) => todo.finalizada === true)).toBe(true);
        });
    });

    it('should filter by prioridad', () => {
      return request(app.getHttpServer())
        .get('/todo/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ prioridad: 'ALTA' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((todo: any) => todo.prioridad === 'ALTA')).toBe(true);
        });
    });

    it('should fail without authorization', () => {
      return request(app.getHttpServer()).get('/todo/list').expect(401);
    });
  });

  describe('/todo/list/:id (GET)', () => {
    let todoId: string;

    beforeAll(async () => {
      const todo = await prismaService.todo.create({
        data: {
          nombre: 'Tarea Específica',
          prioridad: 'MEDIA',
          userId: userId,
        },
      });
      todoId = todo.id;
    });

    afterAll(async () => {
      await prismaService.todo.deleteMany({ where: { id: todoId } });
    });

    it('should get a specific todo by id', () => {
      return request(app.getHttpServer())
        .get(`/todo/list/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', todoId);
          expect(res.body).toHaveProperty('nombre', 'Tarea Específica');
        });
    });

    it('should fail with non-existent id', () => {
      return request(app.getHttpServer())
        .get('/todo/list/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail without authorization', () => {
      return request(app.getHttpServer()).get(`/todo/list/${todoId}`).expect(401);
    });
  });

  describe('/todo/update/:id (PATCH)', () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await prismaService.todo.create({
        data: {
          nombre: 'Tarea Para Actualizar',
          prioridad: 'MEDIA',
          userId: userId,
        },
      });
      todoId = todo.id;
    });

    afterEach(async () => {
      await prismaService.todo.deleteMany({ where: { id: todoId } });
    });

    it('should update a todo', () => {
      return request(app.getHttpServer())
        .patch(`/todo/update/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Tarea Actualizada',
          finalizada: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', todoId);
          expect(res.body).toHaveProperty('nombre', 'Tarea Actualizada');
          expect(res.body).toHaveProperty('finalizada', true);
        });
    });

    it('should update only provided fields', () => {
      return request(app.getHttpServer())
        .patch(`/todo/update/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          finalizada: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('finalizada', true);
          expect(res.body).toHaveProperty('nombre', 'Tarea Para Actualizar');
        });
    });

    it('should fail with invalid id', () => {
      return request(app.getHttpServer())
        .patch('/todo/update/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'Test' })
        .expect(404);
    });

    it('should fail without authorization', () => {
      return request(app.getHttpServer())
        .patch(`/todo/update/${todoId}`)
        .send({ nombre: 'Test' })
        .expect(401);
    });
  });

  describe('/todo/list/:id (DELETE)', () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await prismaService.todo.create({
        data: {
          nombre: 'Tarea Para Eliminar',
          prioridad: 'BAJA',
          userId: userId,
        },
      });
      todoId = todo.id;
    });

    it('should delete a todo', () => {
      return request(app.getHttpServer())
        .delete(`/todo/list/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('eliminada exitosamente');
        });
    });

    it('should fail with non-existent id', () => {
      return request(app.getHttpServer())
        .delete('/todo/list/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail without authorization', () => {
      return request(app.getHttpServer()).delete(`/todo/list/${todoId}`).expect(401);
    });

    it('should not allow deleting todo from another user', async () => {
      // Crear otro usuario
      const otherUserResponse = await request(app.getHttpServer()).post('/auth/register').send({
        nombre: 'Other User',
        email: 'otheruser@example.com',
        password: 'password123',
      });

      const otherToken = otherUserResponse.body.access_token;

      // Intentar eliminar tarea del primer usuario con token del segundo
      await request(app.getHttpServer())
        .delete(`/todo/list/${todoId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      // Limpiar usuario creado
      await prismaService.user.delete({
        where: { email: 'otheruser@example.com' },
      });
    });
  });
});
