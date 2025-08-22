import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import googleIcon from '../../assets/google_ic.png';
import facebookIcon from '../../assets/facebook_ic.png';

interface OAuthButtonsProps {
    onError: (message: string) => void;
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onError }) => {
    const { getGoogleAuthUrl, getFacebookAuthUrl } = useAuth();

    const handleGoogleLogin = async () => {
        try {
            const authUrl = await getGoogleAuthUrl();
            const url = new URL(authUrl);
            url.searchParams.set('provider', 'google');
            window.location.href = url.toString();
        } catch (error: any) {
            console.error('Google login error:', error);
            onError('Failed to initiate Google login. Please try again.');
        }
    };

    const handleFacebookLogin = async () => {
        try {
            const authUrl = await getFacebookAuthUrl();
            const url = new URL(authUrl);
            url.searchParams.set('provider', 'facebook');
            window.location.href = url.toString();
        } catch (error: any) {
            console.error('Facebook login error:', error);
            onError('Failed to initiate Facebook login. Please try again.');
        }
    };

    return (
        <div className="space-y-4">
            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-3 py-0.5 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-md">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full inline-flex items-center justify-center h-12 px-4 border-2 border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-smooth"
                >
                    <img src={googleIcon} alt="Google" className="w-5 h-5" />
                    <span className="ml-2">Google</span>
                </button>

                <button
                    type="button"
                    onClick={handleFacebookLogin}
                    className="w-full inline-flex items-center justify-center h-12 px-4 border-2 border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-smooth"
                >
                    <img src={facebookIcon} alt="Facebook" className="w-5 h-5" />
                    <span className="ml-2">Facebook</span>
                </button>
            </div>
        </div>
    );
}; 