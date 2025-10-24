import { useState, useEffect, useCallback } from 'react';
import { todoApi } from '../services/api';
import type { Todo, TodoListResponse, CreateTodoDto, UpdateTodoDto, Priority } from '../types';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<{
    prioridad?: Priority;
    finalizada?: boolean;
  }>({});

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: TodoListResponse = await todoApi.getAll({
        page,
        limit: 10,
        ...filters,
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
  }, [page, filters]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const createTodo = async (data: CreateTodoDto) => {
    const newTodo = await todoApi.create(data);
    await fetchTodos();
    return newTodo;
  };

  const updateTodo = async (id: string, data: UpdateTodoDto) => {
    const updatedTodo = await todoApi.update(id, data);
    setTodos((prev) => prev.map((todo) => (todo.id === id ? updatedTodo : todo)));
    return updatedTodo;
  };

  const deleteTodo = async (id: string) => {
    await todoApi.delete(id);
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const toggleTodo = async (id: string, finalizada: boolean) => {
    await updateTodo(id, { finalizada });
  };

  return {
    todos,
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
    refetch: fetchTodos,
  };
}