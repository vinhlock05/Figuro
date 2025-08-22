# Figuro Design System

A modern, component-based design system built with React, TypeScript, and Tailwind CSS, featuring a sophisticated color palette and reusable UI components.

## 🎨 Color Palette

### Accent Colors
- **Accent Red** (`#FF4757`) - Primary accent for calls-to-action and highlights
- **Accent Gold** (`#FFD700`) - Secondary accent for premium features and success states
- **Accent Neon Blue** (`#00D2FF`) - Tertiary accent for interactive elements and links

### Primary Colors
- **Primary 50-900** - A comprehensive grayscale palette from light to dark
- **Primary 50** (`#F8FAFC`) - Lightest background
- **Primary 100** (`#F1F5F9`) - Light background
- **Primary 500** (`#64748B`) - Medium text
- **Primary 900** (`#0F172A`) - Darkest text

### Usage Guidelines
- Use accent colors sparingly to draw attention to important elements
- Maintain sufficient contrast ratios for accessibility
- Combine accent colors in gradients for premium feel
- Use primary colors for text, backgrounds, and borders

## 🧩 Component Library

### Core Components

#### Header (`Header.tsx`)
- Top bar with language/currency selection
- Main header with logo, search, and user actions
- Navigation bar with category links
- Responsive design with mobile menu

#### Sidebar (`Sidebar.tsx`)
- Navigation menu for authenticated users
- Collapsible on mobile devices
- Active state indicators
- User profile and logout functionality

#### Footer (`Footer.tsx`)
- Company information and branding
- Quick links and customer service
- Newsletter signup
- Social media links
- Scroll-to-top button

#### ProductCard (`ProductCard.tsx`)
- Multiple variants: default, compact, featured
- Hover effects and animations
- Wishlist and cart integration
- Rating display and stock status
- Responsive image handling

#### ProductFilters (`ProductFilters.tsx`)
- Collapsible filter groups
- Checkbox, radio, and color picker options
- Mobile-responsive modal
- Filter count indicators
- Clear all functionality

#### HomePage (`HomePage.tsx`)
- Hero carousel with multiple slides
- Feature highlights section
- Category showcase
- Featured products grid
- New arrivals section
- Call-to-action sections

### Component Variants

#### Button Variants
- **Primary** - Gradient from red to gold
- **Secondary** - White with border
- **Accent** - Neon blue
- **Disabled** - Reduced opacity states

#### Card Variants
- **Default** - Full-featured product card
- **Compact** - Simplified for list views
- **Featured** - Enhanced for promotional content

## 🎭 Design Tokens

### Typography
- **Font Family**: Inter (system fallback)
- **Heading 1**: 4xl (2.25rem) - Page titles
- **Heading 2**: 3xl (1.875rem) - Section titles
- **Heading 3**: 2xl (1.5rem) - Subsection titles
- **Body Large**: lg (1.125rem) - Important content
- **Body Regular**: base (1rem) - Standard content
- **Body Small**: sm (0.875rem) - Captions and metadata

### Spacing
- **4px** (w-1 h-1) - Minimal spacing
- **8px** (w-2 h-2) - Small spacing
- **12px** (w-3 h-3) - Medium spacing
- **16px** (w-4 h-4) - Large spacing
- **24px** (w-6 h-6) - Section spacing
- **32px** (w-8 h-8) - Major spacing

### Border Radius
- **Default** (rounded) - 4px
- **Large** (rounded-lg) - 8px
- **Extra Large** (rounded-xl) - 12px
- **2XL** (rounded-2xl) - 16px

### Shadows
- **Soft** - Subtle elevation for cards
- **Glow** - Highlighted state for interactive elements

## 🚀 Getting Started

### Installation
The design system is built into the Figuro frontend application. No additional installation is required.

### Usage
```tsx
import ProductCard from './components/customer/ProductCard';
import ProductFilters from './components/customer/ProductFilters';

// Use components with their variants
<ProductCard 
  product={product} 
  variant="featured" 
  onAddToCart={handleAddToCart}
/>

<ProductFilters
  filters={filterConfig}
  selectedFilters={selectedFilters}
  onFilterChange={handleFilterChange}
  onClearAll={handleClearAll}
  totalProducts={totalProducts}
/>
```

### Customization
The design system can be customized by modifying:
- `tailwind.config.ts` - Color definitions and animations
- `src/index.css` - Custom CSS utilities and component styles
- Individual component files for specific behavior

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- Components are designed mobile-first
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized for mobile performance

## ♿ Accessibility

### Features
- High contrast color combinations
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Semantic HTML structure

### Guidelines
- Maintain WCAG 2.1 AA compliance
- Use proper ARIA labels
- Ensure sufficient color contrast
- Provide alternative text for images

## 🎨 Design Principles

### Modern Aesthetics
- Clean, minimalist design
- Generous white space
- Subtle shadows and borders
- Smooth animations and transitions

### User Experience
- Intuitive navigation
- Clear visual hierarchy
- Consistent interaction patterns
- Fast loading and performance

### Brand Identity
- Premium feel through gradients
- Professional color scheme
- Consistent visual language
- Memorable design elements

## 🔧 Development

### File Structure
```
src/
├── components/
│   └── customer/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── Footer.tsx
│       ├── ProductCard.tsx
│       ├── ProductFilters.tsx
│       ├── HomePage.tsx
│       └── DemoPage.tsx
├── layouts/
│   └── CustomerLayout.tsx
├── index.css
└── tailwind.config.ts
```

### Dependencies
- React 18+
- TypeScript 5+
- Tailwind CSS 4+
- Lucide React (icons)
- React Router (navigation)

### Build Process
1. Components are built with TypeScript
2. Styling uses Tailwind CSS classes
3. Custom CSS utilities in `index.css`
4. Responsive design with Tailwind breakpoints

## 📚 Examples

### Demo Page
Visit `/demo` to see all components in action with:
- Component showcase
- Color palette display
- Typography examples
- Spacing and layout demonstrations

### Live Examples
- **Homepage**: `/` - Full homepage with all sections
- **Products**: `/products` - Product listing with filters
- **Components**: `/demo` - Design system showcase

## 🤝 Contributing

### Adding New Components
1. Create component file in appropriate directory
2. Follow existing naming conventions
3. Include TypeScript interfaces
4. Add responsive design considerations
5. Update documentation

### Modifying Existing Components
1. Maintain backward compatibility
2. Update TypeScript interfaces
3. Test responsive behavior
4. Update documentation
5. Consider impact on other components

## 📝 Changelog

### Version 1.0.0
- Initial design system implementation
- Core component library
- Responsive design framework
- Color palette and typography system
- Component variants and states

## 📄 License

This design system is part of the Figuro application and follows the same licensing terms.

---

For questions or contributions, please refer to the main project documentation or contact the development team.
