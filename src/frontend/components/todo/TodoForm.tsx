import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Priority } from '../../types';
import { X } from 'lucide-react';

/**
 * TodoForm component props interface
 */
interface TodoFormProps {
  /** Callback function when form is submitted */
  onSubmit: (data: { nombre: string; prioridad: Priority }) => Promise<void>;
  /** Callback function when form is cancelled */
  onCancel: () => void;
  /** Initial data for editing an existing todo */
  initialData?: {
    nombre: string;
    prioridad: Priority;
  };
}

/**
 * Modal form component for creating or editing todos.
 * Displays a centered modal with priority selection and input field.
 *
 * @param {TodoFormProps} props - Component props
 * @returns {JSX.Element} Todo form modal
 */

export function TodoForm({ onSubmit, onCancel, initialData }: TodoFormProps) {
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [prioridad, setPrioridad] = useState<Priority>(initialData?.prioridad || Priority.MEDIA);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({ nombre, prioridad });
      setNombre('');
      setPrioridad(Priority.MEDIA);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideIn border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Editar Tarea' : 'Nueva Tarea'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="text"
            label="Nombre de la tarea"
            placeholder="Ej: Completar proyecto..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            disabled={isLoading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Prioridad
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.values(Priority).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrioridad(p)}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    prioridad === p
                      ? p === Priority.ALTA
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200'
                        : p === Priority.MEDIA
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-200'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isLoading}
            >
              {initialData ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}