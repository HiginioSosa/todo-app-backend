import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTodos } from '../hooks/useTodos';
import { TodoList } from './todo/TodoList';
import { TodoForm } from './todo/TodoForm';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { LogOut, Plus, Filter, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import type { Todo, Priority } from '../types';

export function Dashboard() {
  const { user, logout } = useAuth();
  const {
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
  } = useTodos();

  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleCreateTodo = async (data: { nombre: string; prioridad: Priority }) => {
    await createTodo(data);
    setShowForm(false);
  };

  const handleUpdateTodo = async (data: { nombre: string; prioridad: Priority }) => {
    if (editingTodo) {
      await updateTodo(editingTodo.id, data);
      setEditingTodo(null);
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const completedCount = todos.filter((t) => t.finalizada).length;
  const pendingCount = todos.filter((t) => !t.finalizada).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                ¡Hola, {user?.nombre}! 👋
              </h1>
              <p className="text-gray-600 mt-1">Gestiona tus tareas de forma eficiente</p>
            </div>
            <Button variant="danger" onClick={logout}>
              <LogOut size={20} className="mr-2" />
              Salir
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Total</p>
                  <p className="text-3xl font-bold text-blue-700">{total}</p>
                </div>
                <AlertCircle size={40} className="text-blue-500 opacity-50" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-semibold">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-700">{pendingCount}</p>
                </div>
                <Circle size={40} className="text-yellow-500 opacity-50" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-semibold">Completadas</p>
                  <p className="text-3xl font-bold text-green-700">{completedCount}</p>
                </div>
                <CheckCircle size={40} className="text-green-500 opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => setShowForm(true)}>
                <Plus size={20} className="mr-2" />
                Nueva Tarea
              </Button>

              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} className="mr-2" />
                Filtros
              </Button>
            </div>

            {Object.keys(filters).length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setFilters({})}>
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Panel de Filtros */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={filters.prioridad || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        prioridad: e.target.value as Priority | undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Todas</option>
                    <option value="ALTA">Alta</option>
                    <option value="MEDIA">Media</option>
                    <option value="BAJA">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={
                      filters.finalizada === undefined
                        ? ''
                        : filters.finalizada
                        ? 'true'
                        : 'false'
                    }
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        finalizada:
                          e.target.value === ''
                            ? undefined
                            : e.target.value === 'true',
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Todas</option>
                    <option value="false">Pendientes</option>
                    <option value="true">Completadas</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Lista de Tareas */}
        <Card>
          <TodoList
            todos={todos}
            isLoading={isLoading}
            error={error}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={handleEdit}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </Card>

        {/* Modales */}
        {showForm && (
          <TodoForm onSubmit={handleCreateTodo} onCancel={() => setShowForm(false)} />
        )}

        {editingTodo && (
          <TodoForm
            onSubmit={handleUpdateTodo}
            onCancel={() => setEditingTodo(null)}
            initialData={{
              nombre: editingTodo.nombre,
              prioridad: editingTodo.prioridad,
            }}
          />
        )}
      </div>
    </div>
  );
}