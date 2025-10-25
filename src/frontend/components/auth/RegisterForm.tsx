import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';

/**
 * RegisterForm component props
 */
interface RegisterFormProps {
  /** Callback to switch to login mode */
  onToggleMode: () => void;
}

/**
 * Registration form component with validation.
 * Includes password strength validation and confirmation matching.
 *
 * @param {RegisterFormProps} props - Component props
 * @returns {JSX.Element} Registration form
 */
export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('La contraseña debe contener al menos una mayúscula, una minúscula y un número');
      return;
    }

    setIsLoading(true);

    try {
      await register({ nombre, email, password });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Error al registrar. Por favor, intenta de nuevo.');
      } else {
        setError('Error al registrar. Por favor, intenta de nuevo.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Crear Cuenta</h2>
        <p className="text-gray-600">Completa el formulario para registrarte</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fadeIn">
            {error}
          </div>
        )}

        <Input
          type="text"
          label="Nombre completo"
          placeholder="Juan Pérez"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="name"
          minLength={2}
          maxLength={100}
        />

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
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="new-password"
          minLength={8}
        />

        <PasswordInput
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="new-password"
        />

        <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
          <p className="font-semibold text-gray-700">La contraseña debe contener:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Mínimo 8 caracteres</li>
            <li>Al menos una letra mayúscula</li>
            <li>Al menos una letra minúscula</li>
            <li>Al menos un número</li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-6"
          isLoading={isLoading}
        >
          Registrarse
        </Button>

        <div className="text-center text-sm text-gray-600 pt-2">
          ¿Ya tienes una cuenta?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            Inicia sesión aquí
          </button>
        </div>
      </form>
    </div>
  );
}