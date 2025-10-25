import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

/**
 * Propiedades del componente ConfirmDialog
 */
interface ConfirmDialogProps {
  /** Título del diálogo de confirmación */
  title: string;
  /** Mensaje descriptivo del diálogo */
  message: string;
  /** Texto del botón de confirmación */
  confirmText?: string;
  /** Texto del botón de cancelación */
  cancelText?: string;
  /** Callback cuando se confirma la acción */
  onConfirm: () => void;
  /** Callback cuando se cancela la acción */
  onCancel: () => void;
  /** Indica si la acción es peligrosa (muestra botón rojo) */
  isDanger?: boolean;
}

/**
 * Componente de diálogo de confirmación personalizado.
 * Reemplaza las alertas nativas del navegador con un modal más visual y moderno.
 *
 * @param {ConfirmDialogProps} props - Propiedades del componente
 * @returns {JSX.Element} Modal de confirmación
 */
export function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isDanger = false,
}: ConfirmDialogProps) {
  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideIn border border-gray-200">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              isDanger ? 'bg-red-100' : 'bg-yellow-100'
            }`}
          >
            <AlertTriangle
              size={24}
              className={isDanger ? 'text-red-600' : 'text-yellow-600'}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
