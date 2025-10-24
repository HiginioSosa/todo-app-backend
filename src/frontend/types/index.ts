export enum Priority {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  nombre: string;
  prioridad: Priority;
  finalizada: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  userId: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    nombre: string;
    email: string;
  };
}

export interface TodoListResponse {
  data: Todo[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTodoDto {
  nombre: string;
  prioridad: Priority;
}

export interface UpdateTodoDto {
  nombre?: string;
  prioridad?: Priority;
  finalizada?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  nombre: string;
  email: string;
  password: string;
}
