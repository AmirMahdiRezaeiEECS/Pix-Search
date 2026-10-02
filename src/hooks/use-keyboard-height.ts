import { useState, useEffect } from 'react';

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // Use visualViewport API which works on iOS Safari and Chrome
    if (window.visualViewport) {
      const updateHeight = () => {
        // Calculate keyboard height by comparing window and viewport heights
        const keyboardHeight = window.innerHeight - window.visualViewport!.height;
        setKeyboardHeight(Math.max(0, keyboardHeight));
      };

      // Update on viewport resize (keyboard show/hide)
      window.visualViewport.addEventListener('resize', updateHeight);
      window.visualViewport.addEventListener('scroll', updateHeight);
      
      // Initial check
      updateHeight();

      return () => {
        window.visualViewport?.removeEventListener('resize', updateHeight);
        window.visualViewport?.removeEventListener('scroll', updateHeight);
      };
    }
  }, []);

  return keyboardHeight;
};
