import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export type SnackbarType = 'success' | 'error';

interface SnackbarProps {
  message: string;
  type: SnackbarType;
  show: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

const Snackbar: React.FC<SnackbarProps> = ({
  message,
  type,
  show,
  onClose,
  autoHideDuration = 2000, // Changed to 2 seconds as requested
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [show, onClose, autoHideDuration]);

  if (!show) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-[90vw]`}>
        <span>{message}</span>
        <button 
          onClick={onClose} 
          className="ml-4 p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Snackbar;