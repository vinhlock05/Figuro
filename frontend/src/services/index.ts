import { authService } from './authService';
import { customerService } from './customerService';

export { authService } from './authService';
export { customerService } from './customerService';

export const getAuthService = () => {
    return authService;
};

export const getCustomerService = () => {
    return customerService;
}; 