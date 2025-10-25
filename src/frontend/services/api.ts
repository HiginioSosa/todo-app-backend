import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  User,
  Todo,
  TodoListResponse,
  TodoStatsResponse,
  CreateTodoDto,
  UpdateTodoDto,
} from '../types';

const api = axios.create({
  baseURL: '/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

// Auth endpoints
export const authApi = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// Todo endpoints
export const todoApi = {
  getStats: async (): Promise<TodoStatsResponse> => {
    const response = await api.get<TodoStatsResponse>('/todo/stats');
    return response.data;
  },

  getAll: async (params?: {
    pagina?: number;
    limite?: number;
    buscar?: string;
    prioridad?: string;
    finalizada?: boolean;
  }): Promise<TodoListResponse> => {
    const queryParams: Record<string, string> = {};

    if (params?.pagina) queryParams.page = params.pagina.toString();
    if (params?.limite) queryParams.limit = params.limite.toString();
    if (params?.buscar) queryParams.buscar = params.buscar;
    if (params?.prioridad) queryParams.prioridad = params.prioridad;
    if (params?.finalizada !== undefined) {
      // Convertir explícitamente a string para evitar que axios omita false
      queryParams.finalizada = params.finalizada ? 'true' : 'false';
    }

    const response = await api.get<TodoListResponse>('/todo/list', {
      params: queryParams,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Todo> => {
    const response = await api.get<Todo>(`/todo/list/${id}`);
    return response.data;
  },

  create: async (data: CreateTodoDto): Promise<Todo> => {
    const response = await api.post<Todo>('/todo/create', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTodoDto): Promise<Todo> => {
    const response = await api.patch<Todo>(`/todo/update/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/todo/list/${id}`);
    return response.data;
  },
};

export default api;
