import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Priority } from '../../types';
import { X } from 'lucide-react';

interface TodoFormProps {
  onSubmit: (data: { nombre: string; prioridad: Priority }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    nombre: string;
    prioridad: Priority;
  };
}

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Editar Tarea' : 'Nueva Tarea'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(Priority).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrioridad(p)}
                  className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                    prioridad === p
                      ? p === Priority.ALTA
                        ? 'bg-red-500 text-white'
                        : p === Priority.MEDIA
                        ? 'bg-yellow-500 text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={isLoading}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
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