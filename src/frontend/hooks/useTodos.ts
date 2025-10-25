import { useState, useEffect } from 'react';
import { todoApi } from '../services/api';
import type {
  Todo,
  TodoListResponse,
  TodoStatsResponse,
  CreateTodoDto,
  UpdateTodoDto,
  Priority,
} from '../types';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStatsResponse>({
    total: 0,
    pendientes: 0,
    completadas: 0,
    alta: 0,
    media: 0,
    baja: 0,
  }); // Para estadísticas globales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<{
    prioridad?: Priority;
    finalizada?: boolean;
  }>({});

  // Cargar estadísticas del endpoint dedicado (solo al inicio y cuando cambien las tareas)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response: TodoStatsResponse = await todoApi.getStats();
        setStats(response);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
      }
    };

    fetchStats();
  }, []); // Solo se ejecuta al montar el componente

  // Cargar tareas filtradas cuando cambian los filtros o la página
  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response: TodoListResponse = await todoApi.getAll({
          pagina: page,
          limite: 10,
          prioridad: filters.prioridad,
          finalizada: filters.finalizada,
        });

        setTodos(response.data);
        setTotalPages(response.meta.totalPages);
        setTotal(response.meta.total);
      } catch (err) {
        setError('Error al cargar las tareas');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, [page, filters]);

  // Función auxiliar para recargar estadísticas
  const refetchStats = async () => {
    try {
      const response: TodoStatsResponse = await todoApi.getStats();
      setStats(response);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  // Función auxiliar para recargar tareas filtradas
  const refetchTodos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: TodoListResponse = await todoApi.getAll({
        pagina: page,
        limite: 10,
        prioridad: filters.prioridad,
        finalizada: filters.finalizada,
      });
      setTodos(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (err) {
      setError('Error al cargar las tareas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createTodo = async (data: CreateTodoDto) => {
    const newTodo = await todoApi.create(data);
    await refetchTodos();
    await refetchStats();
    return newTodo;
  };

  const updateTodo = async (id: string, data: UpdateTodoDto) => {
    const updatedTodo = await todoApi.update(id, data);
    setTodos((prev) => prev.map((todo) => (todo.id === id ? updatedTodo : todo)));
    await refetchStats();
    return updatedTodo;
  };

  const deleteTodo = async (id: string) => {
    await todoApi.delete(id);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    await refetchStats();
  };

  const toggleTodo = async (id: string, finalizada: boolean) => {
    await updateTodo(id, { finalizada });
  };

  return {
    todos,
    stats, // Estadísticas globales (total, pendientes, completadas, etc.)
    isLoading,
    error,
    page,
    setPage,
    totalPages,
    total,
    filters,
    setFilters,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    refetch: refetchTodos,
  };
}
