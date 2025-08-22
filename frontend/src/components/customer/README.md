# Customer Components Structure

This directory contains all customer-facing components organized by functional areas for better maintainability and organization.

## 📁 Folder Structure

```
customer/
├── index.ts                 # Main export file for all components
├── Product/                 # Product-related components
│   ├── index.ts            # Product components exports
│   ├── ProductCard.tsx     # Product display card
│   ├── ProductFilters.tsx  # Product filtering system
│   ├── ProductsPage.tsx    # Product listing page
│   └── ProductDetailPage.tsx # Individual product page
├── Cart/                   # Shopping cart components
│   ├── index.ts            # Cart components exports
│   └── CartPage.tsx        # Shopping cart page
├── Checkout/               # Checkout process components
│   ├── index.ts            # Checkout components exports
│   ├── CheckoutPage.tsx    # Checkout form page
│   └── CheckoutResult.tsx  # Checkout result page
├── Layout/                 # Layout and navigation components
│   ├── index.ts            # Layout components exports
│   ├── Header.tsx          # Main header component
│   ├── Footer.tsx          # Footer component
│   └── Sidebar.tsx         # Navigation sidebar
└── Common/                 # General customer components
    ├── index.ts            # Common components exports
    ├── HomePage.tsx        # Homepage component
    ├── DemoPage.tsx        # Design system demo
    ├── CustomerDashboard.tsx # Customer dashboard
    ├── ProfilePage.tsx     # User profile page
    ├── OrdersPage.tsx      # Order history page
    ├── OrderDetailPage.tsx # Individual order page
    ├── SearchResultsPage.tsx # Search results page
    ├── WishlistPage.tsx    # Wishlist page
    └── NotificationsPage.tsx # Notifications page
```

## 🚀 Usage

### Import from specific functional area:
```tsx
import { ProductCard, ProductFilters } from './components/customer/Product';
import { CartPage } from './components/customer/Cart';
import { CheckoutPage } from './components/customer/Checkout';
```

### Import from main customer index:
```tsx
import { 
    ProductCard, 
    CartPage, 
    CheckoutPage,
    Header,
    Footer 
} from './components/customer';
```

## 🎯 Functional Areas

### Product
Components related to product display, listing, filtering, and details.

### Cart
Shopping cart functionality and cart management.

### Checkout
Checkout process, payment forms, and order confirmation.

### Layout
Navigation, header, footer, and overall page structure.

### Common
General customer pages like dashboard, profile, orders, and search.

## 📝 Benefits

- **Better Organization**: Components are grouped by functionality
- **Easier Maintenance**: Related components are in the same folder
- **Cleaner Imports**: Can import from specific areas or main index
- **Scalability**: Easy to add new components to appropriate folders
- **Team Collaboration**: Developers can work on specific functional areas

## 🔄 Migration Notes

When moving components to this structure:
1. Update import paths in moved components
2. Update import paths in files that use these components
3. Ensure index.ts files export all components
4. Test that all imports work correctly
5. Update documentation and README files
