import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';

/**
 * LoginForm component props
 */
interface LoginFormProps {
  /** Callback to switch to register mode */
  onToggleMode: () => void;
}

/**
 * Login form component with email and password fields.
 * Includes validation, error handling, and loading states.
 *
 * @param {LoginFormProps} props - Component props
 * @returns {JSX.Element} Login form
 */
export function LoginForm({ onToggleMode }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Iniciar Sesión</h2>
        <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fadeIn">
            {error}
          </div>
        )}

        <Input
          type="email"
          label="Correo electrónico"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="email"
        />

        <PasswordInput
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-6"
          isLoading={isLoading}
        >
          Iniciar Sesión
        </Button>

        <div className="text-center text-sm text-gray-600 pt-2">
          ¿No tienes una cuenta?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            Regístrate aquí
          </button>
        </div>
      </form>
    </div>
  );
}