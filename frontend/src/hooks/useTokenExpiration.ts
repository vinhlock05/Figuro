import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useTokenExpiration = () => {
    const { checkTokenExpiration, handleTokenExpiration, isAuthenticated } = useAuth();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Only check token expiration if user is authenticated
        if (!isAuthenticated) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Check token expiration every minute
        intervalRef.current = setInterval(() => {
            if (checkTokenExpiration()) {
                console.log('Token expired, logging out user...');
                handleTokenExpiration();
            }
        }, 60000); // Check every minute

        // Cleanup interval on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAuthenticated, checkTokenExpiration, handleTokenExpiration]);

    // Also check on page focus (when user returns to tab)
    useEffect(() => {
        const handleFocus = () => {
            if (isAuthenticated && checkTokenExpiration()) {
                console.log('Token expired on page focus, logging out user...');
                handleTokenExpiration();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [isAuthenticated, checkTokenExpiration, handleTokenExpiration]);
}; 