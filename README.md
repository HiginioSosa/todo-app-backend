# To-Do App - Full Stack Application

Aplicación completa de gestión de tareas construida con NestJS, React, TypeScript, PostgreSQL y Prisma.

## 🚀 Características

### Backend
- ✅ API RESTful con NestJS
- ✅ Autenticación JWT
- ✅ Base de datos PostgreSQL con Prisma ORM
- ✅ Documentación Swagger/OpenAPI
- ✅ Validación de datos con class-validator
- ✅ Dockerización completa

### Frontend
- ✅ React 19 con TypeScript
- ✅ Vite para desarrollo rápido
- ✅ Tailwind CSS para estilos
- ✅ Componentes reutilizables
- ✅ Context API para manejo de estado
- ✅ Interfaz responsive y moderna

## 📋 Requisitos Previos

- Node.js 22.x
- Docker y Docker Compose
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd todo-app-backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:
```bash
cp .env.example .env
```

### 4. Levantar la base de datos
```bash
docker-compose up postgres -d
```

### 5. Ejecutar migraciones
```bash
npm run prisma:migrate
```

## 🚦 Ejecutar la Aplicación

### Desarrollo (Backend + Frontend)
```bash
# Ejecutar ambos servidores simultáneamente
npm run dev:all
```

### Solo Backend
```bash
npm run start:dev
```

El backend estará disponible en http://localhost:3000
Documentación Swagger: http://localhost:3000/api/docs

### Solo Frontend
```bash
npm run frontend:dev
```

El frontend estará disponible en http://localhost:5173

## 📦 Scripts Disponibles

### Backend
- `npm run start:dev` - Iniciar backend en modo desarrollo
- `npm run start:prod` - Iniciar backend en producción
- `npm run build` - Compilar backend
- `npm run lint` - Ejecutar ESLint
- `npm run format` - Formatear código con Prettier

### Frontend
- `npm run frontend:dev` - Iniciar frontend en desarrollo
- `npm run frontend:build` - Compilar frontend para producción
- `npm run frontend:preview` - Vista previa de producción

### Prisma
- `npm run prisma:generate` - Generar Prisma Client
- `npm run prisma:migrate` - Crear y aplicar migraciones
- `npm run prisma:studio` - Abrir Prisma Studio

### Docker
- `docker-compose up -d` - Levantar todos los servicios
- `docker-compose down` - Detener todos los servicios
- `docker-compose logs -f` - Ver logs

## 🏗️ Estructura del Proyecto
```
todo-app-backend/
├── src/
│   ├── common/           # Decoradores, filtros, pipes comunes
│   ├── config/           # Configuración de la aplicación
│   ├── modules/
│   │   ├── auth/         # Módulo de autenticación
│   │   ├── prisma/       # Módulo de Prisma
│   │   └── todo/         # Módulo de tareas
│   ├── frontend/         # Aplicación React
│   │   ├── components/   # Componentes de React
│   │   ├── contexts/     # Context API
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # Servicios API
│   │   ├── types/        # Tipos TypeScript
│   │   └── utils/        # Utilidades
│   └── main.ts          # Entry point
├── prisma/
│   └── schema.prisma    # Schema de base de datos
├── docker-compose.yml   # Configuración Docker
├── Dockerfile          # Dockerfile para producción
└── README.md
```

## 🔐 API Endpoints

### Autenticación
- `POST /v1/auth/register` - Registrar nuevo usuario
- `POST /v1/auth/login` - Iniciar sesión
- `GET /v1/auth/me` - Obtener usuario actual

### Tareas
- `POST /v1/todo/create` - Crear tarea
- `GET /v1/todo/list` - Listar tareas (con paginación y filtros)
- `GET /v1/todo/list/:id` - Obtener tarea por ID
- `PATCH /v1/todo/update/:id` - Actualizar tarea
- `DELETE /v1/todo/list/:id` - Eliminar tarea

## 🧪 Testing
```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 🐳 Docker

### Desarrollo con Docker
```bash
docker-compose up -d
```

### Producción
```bash
docker-compose -f docker-compose.yml up -d
```

## 📝 Tecnologías Utilizadas

### Backend
- NestJS 11
- TypeScript 5.7
- Prisma 6
- PostgreSQL 16
- JWT Authentication
- Swagger/OpenAPI

### Frontend
- React 19
- TypeScript 5.7
- Vite 7
- Tailwind CSS 3
- Axios
- Lucide React (iconos)

## 👤 Autor

Tu Nombre

## 📄 Licencia

UNLICENSED