import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAuthService } from '../services';
import type { AuthResponse, PasswordResetRequest, PasswordReset, EmailVerification } from '../services/authService';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    // Basic Auth
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    forceLogout: () => void;
    // Profile
    getProfile: () => Promise<void>;
    // Password Reset
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    // Email Verification
    sendVerificationEmail: () => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    // OAuth
    googleLogin: (profile: any) => Promise<void>;
    facebookLogin: (profile: any) => Promise<void>;
    getGoogleAuthUrl: () => Promise<string>;
    getFacebookAuthUrl: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const authService = getAuthService();
                if (authService.isAuthenticated()) {
                    // Try to get fresh user data from server
                    try {
                        const userProfile = await authService.getProfile();
                        setUser(userProfile);
                    } catch (error) {
                        console.error('Token validation failed:', error);
                        // Clear invalid token
                        authService.clearTokens();
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Basic Auth
    const login = async (email: string, password: string, rememberMe?: boolean) => {
        console.log('AuthContext: login called with email:', email);
        try {
            setIsLoading(true);
            const authService = getAuthService();
            console.log('AuthContext: calling authService.login...');
            const response: AuthResponse = await authService.login({ email, password, rememberMe });
            console.log('AuthContext: login response:', response);

            // Check if email is verified
            if (!response.user.emailVerified) {
                // Clear token and throw error
                authService.clearTokens();
                throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
            }

            setUser(response.user);
        } catch (error) {
            console.error('AuthContext: login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: any) => {
        try {
            setIsLoading(true);
            const authService = getAuthService();
            const response: AuthResponse = await authService.register(userData);
            // Don't set user or token after registration - user needs to verify email first
            // setUser(response.user);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            const authService = getAuthService();
            await authService.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const forceLogout = () => {
        const authService = getAuthService();
        authService.clearTokens();
        setUser(null);
    };

    // Profile
    const getProfile = async () => {
        try {
            const authService = getAuthService();
            const userProfile = await authService.getProfile();
            setUser(userProfile);
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    };

    // Password Reset
    const requestPasswordReset = async (email: string) => {
        try {
            const authService = getAuthService();
            await authService.requestPasswordReset({ email });
        } catch (error) {
            throw error;
        }
    };

    const resetPassword = async (token: string, newPassword: string) => {
        try {
            const authService = getAuthService();
            await authService.resetPassword({ token, newPassword });
        } catch (error) {
            throw error;
        }
    };

    // Email Verification
    const sendVerificationEmail = async () => {
        try {
            const authService = getAuthService();
            await authService.sendVerificationEmail();
        } catch (error) {
            throw error;
        }
    };

    const verifyEmail = async (token: string) => {
        try {
            const authService = getAuthService();
            await authService.verifyEmail({ token });
        } catch (error) {
            throw error;
        }
    };

    // OAuth
    const googleLogin = async (profile: any) => {
        try {
            setIsLoading(true);
            const authService = getAuthService();
            const response: AuthResponse = await authService.googleLogin(profile);
            setUser(response.user);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const facebookLogin = async (profile: any) => {
        try {
            setIsLoading(true);
            const authService = getAuthService();
            const response: AuthResponse = await authService.facebookLogin(profile);
            setUser(response.user);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getGoogleAuthUrl = async () => {
        try {
            const authService = getAuthService();
            return await authService.getGoogleAuthUrl();
        } catch (error) {
            throw error;
        }
    };

    const getFacebookAuthUrl = async () => {
        try {
            const authService = getAuthService();
            return await authService.getFacebookAuthUrl();
        } catch (error) {
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        forceLogout,
        getProfile,
        requestPasswordReset,
        resetPassword,
        sendVerificationEmail,
        verifyEmail,
        googleLogin,
        facebookLogin,
        getGoogleAuthUrl,
        getFacebookAuthUrl,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 