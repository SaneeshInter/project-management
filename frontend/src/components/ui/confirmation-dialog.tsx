import { AlertTriangle, X } from 'lucide-react';
import { Button } from './button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger';
  showForceOption?: boolean;
  onForceConfirm?: () => void;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  showForceOption = false,
  onForceConfirm
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const typeConfig = {
    warning: {
      icon: <AlertTriangle className="h-6 w-6" />,
      iconColor: 'text-orange-500',
      titleColor: 'text-orange-700',
      bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      accentColor: 'bg-orange-500'
    },
    danger: {
      icon: <AlertTriangle className="h-6 w-6" />,
      iconColor: 'text-red-500',
      titleColor: 'text-red-700',
      bgGradient: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200',
      accentColor: 'bg-red-500'
    }
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md transform transition-all duration-300 ease-out">
        <div className={`
          bg-white rounded-xl border-2 ${config.borderColor} shadow-2xl
          overflow-hidden
        `}>
          {/* Header with colored accent */}
          <div className={`h-1 ${config.accentColor}`}></div>
          
          {/* Content Area */}
          <div className="p-6">
            {/* Header Section */}
            <div className="flex items-start gap-4 mb-6">
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-full ${config.bgGradient} 
                flex items-center justify-center border ${config.borderColor}
              `}>
                <div className={config.iconColor}>
                  {config.icon}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className={`text-xl font-semibold ${config.titleColor} mb-2`}>
                  {title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {message}
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Action Section */}
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={onClose}
              >
                {cancelText}
              </Button>
              <Button 
                variant={type === 'danger' ? 'destructive' : 'default'}
                onClick={onConfirm}
              >
                {confirmText}
              </Button>
              {showForceOption && onForceConfirm && (
                <Button 
                  variant="destructive"
                  onClick={onForceConfirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Force Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}