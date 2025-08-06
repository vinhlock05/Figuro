# Customer UI Documentation

## Overview

The customer UI provides a comprehensive e-commerce experience with modern, responsive design and intuitive user interface. Built with React, TypeScript, and Tailwind CSS.

## Features

### 🏠 Dashboard
- **Welcome Section**: Personalized greeting with user name
- **Statistics Cards**: Total orders, total spent, wishlist items, active orders
- **Recent Orders**: Quick overview of latest orders with status indicators
- **Featured Products**: Curated product recommendations
- **Quick Actions**: Easy navigation to key features

### 🛍️ Product Browsing
- **Product Grid/List View**: Toggle between grid and list layouts
- **Advanced Filtering**: 
  - Search by product name
  - Filter by category
  - Price range selection
  - Sort by relevance, price, date, name
- **Product Cards**: 
  - Product images with fallback
  - Product name and category
  - Price and rating display
  - Add to cart and wishlist buttons
- **Pagination**: Navigate through product pages

### 🛒 Shopping Cart
- **Cart Management**:
  - View cart items with images and details
  - Update quantities with +/- buttons
  - Remove items with trash icon
  - Clear entire cart
- **Order Summary**:
  - Subtotal calculation
  - Tax calculation (8%)
  - Free shipping
  - Total amount
- **Checkout Flow**: Proceed to checkout button

### 📦 Order Management
- **Order List**: View all orders with status indicators
- **Status Filtering**: Filter by order status (pending, processing, shipped, delivered)
- **Order Details**:
  - Order number and date
  - Item list with images and customizations
  - Order status and payment status
  - Total amount
- **Order Tracking**: View detailed order status and tracking information

### 👤 User Profile
- **Profile Information**:
  - User avatar with initials
  - Personal details (name, email, phone, DOB)
  - Address information
  - Email verification status
- **Security Settings**:
  - Change password functionality
  - Two-factor authentication setup
  - Active session management
- **Notification Preferences**:
  - Email notification settings
  - Push notification preferences
- **Billing Information**:
  - Payment method management
  - Billing address management

### 🔍 Search Functionality
- **Search Results**: Display products matching search query
- **Advanced Filters**:
  - Sort by relevance, price, date, name
  - Price range filtering
  - Category filtering
- **Active Filters**: Visual display of applied filters with remove options
- **No Results Handling**: Helpful messaging when no products found

### 🎨 Design Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional design with Tailwind CSS
- **Loading States**: Spinner animations during data loading
- **Empty States**: Helpful messaging when no data available
- **Notifications**: Toast notifications for user feedback
- **Navigation**: Sidebar navigation with active state indicators

## Components Structure

```
src/
├── components/
│   ├── customer/
│   │   ├── CustomerDashboard.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── SearchResultsPage.tsx
│   ├── common/
│   │   └── Notification.tsx
│   └── layouts/
│       └── CustomerLayout.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
└── services/
    └── customerService.ts
```

## Key Components

### CustomerLayout
- **Sidebar Navigation**: Home, Products, Orders, Profile
- **Header**: Search bar, notifications, cart, user menu
- **Mobile Responsive**: Collapsible sidebar for mobile devices
- **Real-time Updates**: Cart count and notification count

### CustomerDashboard
- **Statistics Overview**: Key metrics display
- **Recent Activity**: Latest orders and featured products
- **Quick Actions**: Direct links to main features

### ProductsPage
- **Product Display**: Grid and list view options
- **Filtering System**: Advanced search and filter capabilities
- **Pagination**: Navigate through product pages
- **Add to Cart**: One-click cart addition

### CartPage
- **Cart Management**: Full cart functionality
- **Order Summary**: Price breakdown and totals
- **Checkout Flow**: Seamless checkout process

### OrdersPage
- **Order History**: Complete order listing
- **Status Tracking**: Visual status indicators
- **Order Details**: Detailed order information

### ProfilePage
- **Account Management**: Complete profile management
- **Security Settings**: Password and 2FA management
- **Preferences**: Notification and billing settings

## API Integration

The customer UI integrates with the backend API through the `customerService`:

- **Products**: Browse, search, and filter products
- **Cart**: Add, update, remove, and clear cart items
- **Orders**: View order history and details
- **Profile**: Manage user account and preferences
- **Notifications**: Real-time notification system

## State Management

- **React Context**: Auth and notification state
- **Local State**: Component-specific state management
- **URL State**: Search parameters and filters in URL
- **Real-time Updates**: Cart and notification counts

## Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive layout for tablets
- **Desktop Experience**: Full-featured desktop interface
- **Touch Friendly**: Optimized for touch interactions

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG compliant color schemes

## Performance

- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Proper image handling with fallbacks
- **Efficient State Updates**: Minimal re-renders
- **Caching**: API response caching where appropriate

## Future Enhancements

- **Wishlist Functionality**: Save products for later
- **Product Reviews**: Customer review system
- **Advanced Search**: Autocomplete and suggestions
- **Real-time Chat**: Customer support integration
- **Payment Integration**: Multiple payment methods
- **Order Tracking**: Real-time shipping updates 