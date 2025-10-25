import { useState } from 'react';
import { Check, Trash2, Edit, Clock } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { Todo } from '../../types';

/**
 * Propiedades del componente TodoItem
 */
interface TodoItemProps {
  /** El item de tarea a mostrar */
  todo: Todo;
  /** Callback para cambiar el estado de completado */
  onToggle: (id: string, finalizada: boolean) => Promise<void>;
  /** Callback para eliminar la tarea */
  onDelete: (id: string) => Promise<void>;
  /** Callback para editar la tarea */
  onEdit: (todo: Todo) => void;
}

/**
 * Componente de item individual de tarea con acciones.
 * Muestra la información de la tarea con funcionalidad de completar, editar y eliminar.
 *
 * @param {TodoItemProps} props - Propiedades del componente
 * @returns {JSX.Element} Card de item de tarea
 */
export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(todo.id, !todo.finalizada);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDelete(false);
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
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
    <>
      <div
        className={`bg-white rounded-xl shadow-md hover:shadow-lg p-5 border-l-4 transition-all hover-lift ${
          todo.finalizada ? 'opacity-60 border-gray-300 bg-gray-50' : getPriorityColor(todo.prioridad).replace('bg-', 'border-')
        }`}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`mt-1 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all transform hover:scale-110 ${
              todo.finalizada
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-500 shadow-md'
                : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
            }`}
            aria-label={todo.finalizada ? 'Marcar como pendiente' : 'Marcar como completada'}
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

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(todo)}
              className="p-2.5 text-primary-600 hover:bg-primary-50 rounded-xl transition-all hover:scale-110 disabled:opacity-50"
              disabled={isDeleting || isToggling}
              aria-label="Editar tarea"
            >
              <Edit size={18} />
            </button>

            <button
              onClick={handleDeleteClick}
              disabled={isDeleting || isToggling}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 disabled:opacity-50"
              aria-label="Eliminar tarea"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {showConfirmDelete && (
        <ConfirmDialog
          title="Eliminar Tarea"
          message={`¿Estás seguro de que deseas eliminar la tarea "${todo.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDanger
        />
      )}
    </>
  );
}