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
  autoHideDuration = 3000, // 3 seconds display time
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!show) return;

    setIsExiting(false);

    // Helper to start exit and close
    const scheduleTimers = () => {
      const exitTimer = setTimeout(() => setIsExiting(true), autoHideDuration - 200);
      const hideTimer = setTimeout(() => onClose(), autoHideDuration);
      return { exitTimer, hideTimer };
    };

    let timers = scheduleTimers();

  // If hovered, pause timers by clearing them; when hover ends, reschedule for remaining time
    const handleMouseEnter = () => {
      if (!isHovered) {
        setIsHovered(true);
        // Clear existing timers
        clearTimeout(timers.exitTimer);
        clearTimeout(timers.hideTimer);
      }
    };
    const handleMouseLeave = () => {
      if (isHovered) {
        setIsHovered(false);
        // Reschedule timers for remaining time
        // Simple approach: reset full duration on mouse leave
        timers = scheduleTimers();
      }
    };

    // Attach to document so hover works even if pointer leaves the component quickly
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timers.exitTimer);
      clearTimeout(timers.hideTimer);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [show, onClose, autoHideDuration, isHovered]);

  if (!show) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const animationClass = isExiting ? 'animate-pop-out' : 'animate-fade-in';

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${animationClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center justify-between min-w-[320px] max-w-[90vw] backdrop-blur-sm`}
        role="status"
        aria-live={type === 'error' ? 'assertive' : 'polite'}
      >
        <div className="flex items-center gap-3 flex-1 mr-3">
          {/* small status icon */}
          <div className="flex-shrink-0">
            {type === 'success' ? (
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            ) : (
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9L9 15M9 9l6 6"/></svg>
            )}
          </div>

          <span className="text-sm font-medium leading-5 text-left">{message}</span>
        </div>

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