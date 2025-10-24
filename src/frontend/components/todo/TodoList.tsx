import { TodoItem } from './TodoItem';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Todo } from '../../types';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  onToggle: (id: string, finalizada: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (todo: Todo) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TodoList({
  todos,
  isLoading,
  error,
  onToggle,
  onDelete,
  onEdit,
  page,
  totalPages,
  onPageChange,
}: TodoListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No hay tareas aún</p>
        <p className="text-gray-400 text-sm mt-2">
          Crea tu primera tarea para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            variant="secondary"
            size="sm"
          >
            <ChevronLeft size={20} />
          </Button>

          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>

          <Button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            variant="secondary"
            size="sm"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      )}
    </div>
  );
}