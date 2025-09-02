import { X, AlertTriangle, AlertCircle, Info, Lightbulb } from 'lucide-react';
import { Button } from './button';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  suggestion?: string;
  type?: 'error' | 'warning' | 'info';
}

export default function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  suggestion,
  type = 'error'
}: AlertDialogProps) {
  if (!isOpen) return null;

  const typeConfig = {
    error: {
      icon: <AlertCircle className="h-6 w-6" />,
      iconColor: 'text-red-500',
      titleColor: 'text-red-700',
      bgGradient: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200',
      shadowColor: 'shadow-red-100',
      accentColor: 'bg-red-500'
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6" />,
      iconColor: 'text-orange-500',
      titleColor: 'text-orange-700',
      bgGradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      shadowColor: 'shadow-orange-100',
      accentColor: 'bg-orange-500'
    },
    info: {
      icon: <Info className="h-6 w-6" />,
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-700',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      shadowColor: 'shadow-blue-100',
      accentColor: 'bg-blue-500'
    }
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`
          w-full max-w-lg transform transition-all duration-300 ease-out
          animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4
        `}
      >
        {/* Main Alert Card */}
        <div className={`
          bg-white rounded-xl border-2 ${config.borderColor} shadow-2xl ${config.shadowColor}
          overflow-hidden
        `}>
          {/* Header with colored accent */}
          <div className={`h-1 ${config.accentColor}`}></div>
          
          {/* Content Area */}
          <div className="p-6">
            {/* Header Section */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-full ${config.bgGradient} 
                flex items-center justify-center border ${config.borderColor}
              `}>
                <div className={config.iconColor}>
                  {config.icon}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className={`text-xl font-semibold ${config.titleColor} mb-1`}>
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

            {/* Suggestion Section */}
            {suggestion && (
              <div className="mb-6">
                <div className={`
                  ${config.bgGradient} border ${config.borderColor} rounded-lg p-4
                  relative overflow-hidden
                `}>
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white transform translate-x-8 -translate-y-8"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white transform -translate-x-4 translate-y-4"></div>
                  </div>
                  
                  <div className="relative flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Lightbulb className={`h-4 w-4 ${config.iconColor}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${config.titleColor} mb-1`}>
                        How to resolve this:
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Section */}
            <div className="flex justify-end gap-3">
              <Button 
                onClick={onClose}
                className="px-6 py-2 font-medium transition-all duration-200 hover:scale-105"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}