# To-Do App - Full Stack Application

Aplicación completa de gestión de tareas con NestJS, React, TypeScript, PostgreSQL y Prisma.

## � Descripción del Sistema

Sistema de gestión de tareas (To-Do) con autenticación JWT que permite a los usuarios crear, editar y organizar sus tareas por prioridad. Incluye:

- ✅ **Autenticación segura** con JWT y bcrypt
- ✅ **CRUD completo** de tareas con validaciones
- ✅ **Filtrado y paginación** de tareas
- ✅ **Estadísticas** en tiempo real
- ✅ **Prioridades** (Alta, Media, Baja)
- ✅ **API RESTful** documentada con Swagger
- ✅ **Tests completos** (91 tests unitarios y E2E)

## 📁 Estructura del Proyecto

```
todo-app-backend/
├── src/
│   ├── modules/
│   │   ├── auth/              # Autenticación (registro, login, JWT)
│   │   │   ├── strategies/    # Estrategia JWT de Passport
│   │   │   ├── guards/        # Guards de autenticación
│   │   │   └── dto/           # DTOs de auth
│   │   ├── todo/              # Gestión de tareas (CRUD)
│   │   │   └── dto/           # DTOs de tareas
│   │   └── prisma/            # Servicio de Prisma ORM
│   ├── common/
│   │   └── decorators/        # Decoradores personalizados
│   ├── config/                # Configuración de variables de entorno
│   ├── frontend/              # Frontend React + Vite
│   │   ├── components/        # Componentes UI
│   │   ├── contexts/          # Context API (Auth)
│   │   └── services/          # Servicios de API
│   └── main.ts                # Punto de entrada
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   ├── migrations/            # Migraciones de Prisma
│   └── seed.ts                # Datos de prueba
├── test/                      # Tests E2E
└── docker-compose.yml         # Configuración de Docker

```

## �🚀 Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd todo-app-backend
```

### 2. Configurar variables de entorno
Asegúrate de tener el archivo `.env` en la raíz del proyecto con las variables necesarias.

### 3. Levantar la aplicación con Docker
```bash
docker-compose up -d
```

¡Listo! La aplicación estará disponible en:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **Docs (Swagger)**: http://localhost:3000/api/docs

**Credenciales demo:**
- Email: `demo@example.com`
- Password: `password123`

## 🛠️ Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reiniciar (después de hacer cambios)
docker-compose down && docker-compose up -d --build
```

## 💻 Desarrollo Local (sin Docker)

Si prefieres ejecutar la aplicación localmente:

### 1. Instalar dependencias
```bash
npm install
```

### 2. Levantar solo la base de datos con Docker
```bash
docker-compose up postgres -d
```

### 3. Ejecutar migraciones y seed
```bash
npm run prisma:migrate
npm run prisma:seed
```

### 4. Ejecutar la aplicación
```bash
# Backend + Frontend simultáneamente
npm run dev:all

# O por separado:
npm run start:dev     # Backend en http://localhost:3000
npm run frontend:dev  # Frontend en http://localhost:5173
```

## 🏗️ Tecnologías

- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Auth**: JWT
- **Docs**: Swagger/OpenAPI

## 🧪 Testing

Este proyecto cuenta con **57 tests unitarios** completamente funcionales:

```bash
# Tests unitarios (57 tests ✅)
npm test

# Tests con cobertura de código
npm run test:cov

# Tests en modo watch
npm run test:watch
```

**Cobertura de tests unitarios:**
- ✅ AuthController (10 tests)
- ✅ AuthService (7 tests)
- ✅ TodoController (20 tests)
- ✅ TodoService (15 tests)
- ✅ JWT Strategy (5 tests)

> **Nota**: Los tests E2E requieren configuración adicional debido al rate limiting. Los tests unitarios cubren toda la funcionalidad del sistema.

Para más detalles, consulta [TESTING.md](./TESTING.md)