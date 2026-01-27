import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to handle deep links from external apps (e.g., Safari after Stripe payment)
 * This allows users to return to the app automatically after completing payment
 */
export const useDeepLinks = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Only set up deep link listeners on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleAppUrlOpen = (event: URLOpenListenerEvent) => {
      console.log('[DeepLink] Received URL:', event.url);
      
      try {
        const url = new URL(event.url);
        
        // Handle steadysteps:// scheme or https://steadysteps.app URLs
        const path = url.pathname || url.host;
        const searchParams = url.searchParams.toString();
        const fullPath = searchParams ? `${path}?${searchParams}` : path;
        
        console.log('[DeepLink] Navigating to:', fullPath);
        
        // Navigate to the appropriate route
        if (path.includes('profile-setup')) {
          navigate(`/profile-setup${searchParams ? '?' + searchParams : ''}`, { replace: true });
        } else if (path === '/' || path === '') {
          navigate('/', { replace: true });
        } else {
          navigate(fullPath, { replace: true });
        }
      } catch (error) {
        console.error('[DeepLink] Error parsing URL:', error);
        // Default to home on error
        navigate('/', { replace: true });
      }
    };

    // Listen for app URL open events (deep links)
    App.addListener('appUrlOpen', handleAppUrlOpen);

    // Listen for app state changes (returning from background)
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        console.log('[DeepLink] App became active');
      }
    });

    // Cleanup listeners on unmount
    return () => {
      App.removeAllListeners();
    };
  }, [navigate]);
};

/**
 * Check if we're running in a native app context
 */
export const isNativeApp = () => Capacitor.isNativePlatform();

/**
 * Get the platform (ios, android, or web)
 */
export const getPlatform = () => Capacitor.getPlatform();
