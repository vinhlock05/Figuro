import React, { useState } from 'react';
import { Login } from '../components/auth/Login';
import { Register } from '../components/auth/Register';

export const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);

    const switchToRegister = () => setIsLogin(false);
    const switchToLogin = () => setIsLogin(true);

    return (
        <div>
            {isLogin ? (
                <Login onSwitchToRegister={switchToRegister} />
            ) : (
                <Register onSwitchToLogin={switchToLogin} />
            )}
        </div>
    );
}; 