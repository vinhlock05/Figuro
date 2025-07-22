# Frontend - React Authentication & Admin Dashboard

This is a React application built with Vite, TypeScript, and Tailwind CSS that provides a complete authentication system with role-based routing and admin dashboard functionality.

## Features

- 🔐 **Authentication System**: Complete login and registration with JWT tokens
- 👥 **Role-Based Access**: Admin and Customer roles with different dashboards
- 📊 **Admin Dashboard**: Complete admin panel with product, user, and order management
- 📱 **Responsive Design**: Beautiful UI that works on all devices
- ⚡ **Fast Development**: Built with Vite for lightning-fast development
- 🎨 **Modern UI**: Styled with Tailwind CSS and Lucide React icons
- ✅ **Form Validation**: Comprehensive form validation using react-hook-form and yup
- 🔄 **Auto Token Refresh**: Automatic token refresh on 401 errors
- 🛡️ **Type Safety**: Full TypeScript support
- 🚀 **React Router**: Client-side routing with protected routes

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form management
- **Yup** - Form validation
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the frontend directory:
   ```bash
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.tsx          # Login form component
│   │   ├── Register.tsx       # Registration form component
│   │   ├── ForgotPassword.tsx # Password reset form
│   │   ├── ResetPassword.tsx  # Password reset confirmation
│   │   ├── OTPVerification.tsx # Email verification
│   │   └── OAuthButtons.tsx   # OAuth login buttons
│   ├── admin/
│   │   ├── AdminLayout.tsx    # Admin layout with sidebar
│   │   ├── AdminDashboard.tsx # Admin dashboard overview
│   │   ├── ProductsManagement.tsx # Product CRUD
│   │   ├── UsersManagement.tsx # User management
│   │   └── OrdersManagement.tsx # Order management
│   └── Dashboard.tsx          # Customer dashboard
├── contexts/
│   ├── AuthContext.tsx        # Authentication context
│   └── AdminContext.tsx       # Admin state management
├── services/
│   ├── authService.ts         # Authentication API service
│   └── adminService.ts        # Admin API service
├── App.tsx                    # Main app with routing
└── main.tsx                   # App entry point
```

## Authentication Flow

1. **Login**: Users can sign in with email and password
2. **Role-Based Redirect**: After login, users are redirected based on their role:
   - **Admin**: Redirected to `/admin` dashboard
   - **Customer**: Redirected to `/dashboard`
3. **Register**: New users can create an account with validation
4. **Email Verification**: Users must verify their email before accessing features
5. **Token Management**: JWT tokens are automatically stored and refreshed
6. **Protected Routes**: Routes are protected based on authentication and role
7. **Logout**: Users can safely log out and clear their session

## Admin Dashboard Features

### Dashboard Overview
- **Statistics Cards**: Total users, orders, products, and revenue
- **Recent Orders**: Latest order activity with status indicators
- **Top Products**: Best-selling products with performance metrics

### Product Management
- **Product Listing**: View all products with search and filtering
- **Add Product**: Create new products with form validation
- **Edit Product**: Update product information and pricing
- **Delete Product**: Remove products with confirmation

### User Management
- **User Listing**: View all users with search functionality
- **Role Management**: Change user roles between admin and customer
- **User Deletion**: Remove user accounts with confirmation
- **Email Verification Status**: Track email verification status

### Order Management
- **Order Listing**: View all orders with status filtering
- **Status Updates**: Update order status (pending, processing, shipped, delivered, cancelled)
- **Order Details**: View detailed order information and items
- **Order Tracking**: Monitor order progress and shipping status

## Routing Structure

### Public Routes
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset confirmation
- `/otp-verification` - Email verification

### Protected Routes
- `/dashboard` - Customer dashboard (requires customer role)
- `/admin` - Admin dashboard (requires admin role)
- `/admin/products` - Product management
- `/admin/users` - User management
- `/admin/orders` - Order management

## API Endpoints

The frontend expects the following API endpoints from your backend:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Admin (requires admin role)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/orders` - List orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/orders/:id` - Get order details

## Environment Variables

- `VITE_API_BASE_URL`: The base URL of your backend API (default: http://localhost:8000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

### Customer Dashboard
- User profile information
- Email verification status
- Account security overview
- Logout functionality

### Admin Dashboard
- **Responsive Layout**: Sidebar navigation with mobile support
- **Real-time Data**: Live statistics and recent activity
- **CRUD Operations**: Full create, read, update, delete functionality
- **Search & Filter**: Advanced search and filtering capabilities
- **Status Management**: Order status updates and user role management
- **Modal Dialogs**: Inline editing and confirmation dialogs

## Styling

The application uses Tailwind CSS for styling with a clean, modern design. The color scheme is based on Indigo as the primary color with proper contrast and accessibility considerations.

## Security

- JWT tokens are stored in localStorage
- Automatic token refresh on 401 errors
- Secure logout that clears all tokens
- Role-based route protection
- Form validation to prevent invalid data submission

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
