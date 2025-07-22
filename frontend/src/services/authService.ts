import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterData {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    phone?: string;
}

export interface AuthResponse {
    token?: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        role: string;
        emailVerified: boolean;
        createdAt: string;
    };
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordReset {
    token: string;
    newPassword: string;
}

export interface EmailVerification {
    token: string;
}

export interface OAuthProfile {
    id: string;
    emails: Array<{ value: string }>;
    displayName: string;
    photos?: Array<{ value: string }>;
}

class AuthService {
    private api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Add request interceptor to include auth token
    constructor() {
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Add response interceptor to handle 401 errors
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Clear tokens on 401 error
                    this.clearTokens();
                }
                return Promise.reject(error);
            }
        );
    }

    // Basic Auth
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        console.log('Making login request to:', `${this.api.defaults.baseURL}/api/auth/login`);
        console.log('Credentials:', credentials);

        const response = await this.api.post('/api/auth/login', credentials);
        const responseData = response.data;

        console.log('Login response:', responseData);

        // Extract data from the response structure
        const data = responseData.data;

        // Store token
        localStorage.setItem('access_token', data.token);

        return data;
    }

    async register(userData: RegisterData): Promise<AuthResponse> {
        console.log('Making register request to:', `${this.api.defaults.baseURL}/api/auth/register`);
        console.log('User data:', userData);

        const response = await this.api.post('/api/auth/register', userData);
        const responseData = response.data;

        console.log('Register response:', responseData);

        // Extract data from the response structure
        const data = responseData.data;

        // Don't store token after registration - user needs to verify email first
        // localStorage.setItem('access_token', data.token);

        return data;
    }

    async logout(): Promise<void> {
        try {
            // Your backend doesn't have a logout endpoint, so we just clear tokens
            this.clearTokens();
        } catch (error) {
            console.error('Logout error:', error);
            this.clearTokens();
        }
    }

    // User Profile
    async getProfile(): Promise<AuthResponse['user']> {
        const response = await this.api.get('/api/auth/profile');
        return response.data.data.user;
    }

    // Password Reset
    async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
        await this.api.post('/api/auth/request-reset', data);
    }

    async resetPassword(data: PasswordReset): Promise<void> {
        await this.api.post('/api/auth/reset-password', data);
    }

    // Email Verification
    async sendVerificationEmail(): Promise<void> {
        await this.api.post('/api/auth/send-verification');
    }

    async verifyEmail(data: EmailVerification): Promise<void> {
        await this.api.post('/api/auth/verify-email', data);
    }

    // OAuth
    async googleLogin(profile: OAuthProfile): Promise<AuthResponse> {
        const response = await this.api.post('/api/auth/google-login', { profile });
        const data = response.data.data;
        localStorage.setItem('access_token', data.token);
        return data;
    }

    async facebookLogin(profile: OAuthProfile): Promise<AuthResponse> {
        const response = await this.api.post('/api/auth/facebook-login', { profile });
        const data = response.data.data;
        localStorage.setItem('access_token', data.token);
        return data;
    }

    async getGoogleAuthUrl(): Promise<string> {
        const response = await this.api.get('/api/auth/google');
        return response.data.data.authUrl;
    }

    async getFacebookAuthUrl(): Promise<string> {
        const response = await this.api.get('/api/auth/facebook');
        return response.data.data.authUrl;
    }



    clearTokens(): void {
        localStorage.removeItem('access_token');
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    }

    getCurrentUser() {
        const token = localStorage.getItem('access_token');
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch (error) {
            return null;
        }
    }
}

export const authService = new AuthService(); 