import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerService } from '../services/customerService';

interface CartContextType {
    cartItemCount: number;
    updateCartCount: () => Promise<void>;
    incrementCartCount: () => void;
    decrementCartCount: () => void;
    clearCartCount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cartItemCount, setCartItemCount] = useState(0);

    const updateCartCount = async () => {
        try {
            const cart = await customerService.getCart();
            setCartItemCount(cart.itemCount || 0);
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    };

    const incrementCartCount = () => {
        setCartItemCount(prev => prev + 1);
    };

    const decrementCartCount = () => {
        setCartItemCount(prev => Math.max(0, prev - 1));
    };

    const clearCartCount = () => {
        setCartItemCount(0);
    };

    useEffect(() => {
        updateCartCount();
    }, []);

    const value: CartContextType = {
        cartItemCount,
        updateCartCount,
        incrementCartCount,
        decrementCartCount,
        clearCartCount,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}; 