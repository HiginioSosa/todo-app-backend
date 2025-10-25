# To-Do App - Full Stack Application

Aplicación completa de gestión de tareas con NestJS, React, TypeScript, PostgreSQL y Prisma.

## 🚀 Inicio Rápido

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
- **Docs**: http://localhost:3000/api/docs

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

## 🏗️ Tecnologías

- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Auth**: JWT
- **Docs**: Swagger/OpenAPI