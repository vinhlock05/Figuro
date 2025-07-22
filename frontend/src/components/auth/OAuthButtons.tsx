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
            // Add provider parameter to callback URL
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
            // Add provider parameter to callback URL
            const url = new URL(authUrl);
            url.searchParams.set('provider', 'facebook');
            window.location.href = url.toString();
        } catch (error: any) {
            console.error('Facebook login error:', error);
            onError('Failed to initiate Facebook login. Please try again.');
        }
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <img src={googleIcon} alt="Google" className="w-5 h-5" />
                    <span className="ml-2">Google</span>
                </button>

                <button
                    type="button"
                    onClick={handleFacebookLogin}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <img src={facebookIcon} alt="Facebook" className="w-5 h-5" />
                    <span className="ml-2">Facebook</span>
                </button>
            </div>
        </div>
    );
}; 