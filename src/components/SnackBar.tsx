import React, { useEffect, useState } from 'react';
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
  autoHideDuration = 2000, // 2 seconds display time
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show) {
      setIsExiting(false);
      
      // Start exit animation 200ms before hiding
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, autoHideDuration - 200);

      // Hide the snackbar after the animation completes
      const hideTimer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [show, onClose, autoHideDuration]);

  if (!show) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const animationClass = isExiting ? 'animate-pop-out' : 'animate-fade-in';

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${animationClass}`}>
      <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center justify-between min-w-[320px] max-w-[90vw] backdrop-blur-sm`}>
        <span className="text-sm font-medium leading-5 text-center flex-1 mr-3">{message}</span>
        <button 
          onClick={() => {
            setIsExiting(true);
            setTimeout(onClose, 200); // Wait for animation to complete
          }} 
          className="flex-shrink-0 p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Snackbar;