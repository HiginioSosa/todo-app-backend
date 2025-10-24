import { useState } from 'react';
import { Check, Trash2, Edit, Clock } from 'lucide-react';
import type { Todo } from '../../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, finalizada: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (todo: Todo) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(todo.id, !todo.finalizada);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      setIsDeleting(true);
      try {
        await onDelete(todo.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'ALTA':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BAJA':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow p-4 border-l-4 transition-all ${
        todo.finalizada ? 'opacity-60 border-gray-300' : getPriorityColor(todo.prioridad).replace('bg-', 'border-')
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            todo.finalizada
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-green-500'
          }`}
        >
          {todo.finalizada && <Check size={16} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-gray-800 mb-1 ${
              todo.finalizada ? 'line-through text-gray-500' : ''
            }`}
          >
            {todo.nombre}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                todo.prioridad
              )}`}
            >
              {todo.prioridad}
            </span>

            <span className="text-gray-500 flex items-center gap-1">
              <Clock size={14} />
              {new Date(todo.fechaCreacion).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onEdit(todo)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            disabled={isDeleting || isToggling}
          >
            <Edit size={18} />
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting || isToggling}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}