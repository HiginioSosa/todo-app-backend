import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (opcional, comentar si no quieres limpiar)
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuario de ejemplo
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      nombre: 'Usuario Demo',
      email: 'demo@example.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Usuario creado:', { email: user.email });

  // Crear tareas de ejemplo
  const todos = await prisma.todo.createMany({
    data: [
      {
        nombre: 'Completar el proyecto de Docker',
        prioridad: 'ALTA',
        finalizada: false,
        userId: user.id,
      },
      {
        nombre: 'Revisar documentación de NestJS',
        prioridad: 'MEDIA',
        finalizada: false,
        userId: user.id,
      },
      {
        nombre: 'Configurar CI/CD',
        prioridad: 'BAJA',
        finalizada: false,
        userId: user.id,
      },
      {
        nombre: 'Escribir tests unitarios',
        prioridad: 'ALTA',
        finalizada: true,
        userId: user.id,
      },
    ],
  });

  console.log(`✅ ${todos.count} tareas creadas`);
  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Credenciales de acceso:');
  console.log('   Email: demo@example.com');
  console.log('   Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
