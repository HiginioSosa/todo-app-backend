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
    stats,
    isLoading,
    error,
    page,
    setPage,
    totalPages,
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

  // Estadísticas globales - SIEMPRE muestran el total de todas las tareas del usuario
  // Los filtros NO afectan estas estadísticas, solo afectan la lista de tareas mostrada
  const totalCount = stats.total;
  const completedCount = stats.completadas;
  const pendingCount = stats.pendientes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-600 p-4 sm:p-6 lg:p-8 animate-gradient">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 animate-fadeIn border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1">
                ¡Hola, {user?.nombre}! 👋
              </h1>
              <p className="text-gray-600">Gestiona tus tareas de forma eficiente</p>
            </div>
            <Button variant="danger" onClick={logout} className="flex items-center gap-2">
              <LogOut size={20} />
              <span>Salir</span>
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 hover-lift transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-semibold mb-1">Total</p>
                  <p className="text-4xl font-bold text-blue-800">{totalCount}</p>
                </div>
                <div className="bg-blue-200/50 p-3 rounded-full">
                  <AlertCircle size={32} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 hover-lift transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-semibold mb-1">Pendientes</p>
                  <p className="text-4xl font-bold text-orange-800">{pendingCount}</p>
                </div>
                <div className="bg-orange-200/50 p-3 rounded-full">
                  <Circle size={32} className="text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200 hover-lift transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 font-semibold mb-1">Completadas</p>
                  <p className="text-4xl font-bold text-emerald-800">{completedCount}</p>
                </div>
                <div className="bg-emerald-200/50 p-3 rounded-full">
                  <CheckCircle size={32} className="text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <Card className="mb-6 animate-slideIn">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => setShowForm(true)} className="flex items-center gap-2">
                <Plus size={20} />
                <span>Nueva Tarea</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter size={20} />
                <span>Filtros</span>
              </Button>
            </div>

            {Object.keys(filters).length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => {
                setFilters({});
                setPage(1);
              }}>
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Panel de Filtros */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={filters.prioridad || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const newFilters = { ...filters };
                      if (value) {
                        newFilters.prioridad = value as Priority;
                      } else {
                        delete newFilters.prioridad;
                      }
                      setFilters(newFilters);
                      setPage(1); // Reset a la primera página
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
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
                    onChange={(e) => {
                      const value = e.target.value;
                      const newFilters = { ...filters };
                      if (value === '') {
                        delete newFilters.finalizada;
                      } else {
                        newFilters.finalizada = value === 'true';
                      }
                      setFilters(newFilters);
                      setPage(1); // Reset a la primera página
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
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
        <Card className="animate-slideIn">
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