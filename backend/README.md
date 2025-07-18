# Figuro Backend

E-commerce backend for custom anime figures with Prisma ORM and PostgreSQL.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://figuro_user:yourpassword@localhost:5432/figuro_db"
```

### 3. Database Setup

#### Option A: Using Migrations (Recommended)
```bash
# Generate Prisma client
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

#### Option B: Using Push (Development only)
```bash
# Push schema to database
npm run db:push

# Seed the database
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

## 📊 Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:migrate:deploy` | Deploy migrations to production |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:reset` | Reset database and re-seed |

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts with role-based access
- **categories** - Product categories (Naruto, One Piece, etc.)
- **products** - Anime figures with customization options
- **customization_options** - Product customization choices
- **carts** & **cart_items** - Shopping cart functionality
- **orders** & **order_items** - Order management
- **payments** - Payment tracking with Vietnamese gateways
- **notifications** - Email/SMS notifications
- **voice_agent_contexts** - Voice agent conversation state

### Key Features
- ✅ Role-based access control (customer, admin, moderator)
- ✅ SEO-friendly product URLs (slugs)
- ✅ Customization tracking with price deltas
- ✅ Payment status tracking
- ✅ Order status history
- ✅ Voice agent context persistence

## 🔐 Authentication

### Default Users (from seed)
- **Admin**: `admin@figuro.com` / `admin123`
- **Customer**: `customer@example.com` / `customer123`

## 🛠️ Development

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Run `npm run db:seed` to update seed data

### Adding New Features
1. Update schema in `prisma/schema.prisma`
2. Create migration: `npm run db:migrate`
3. Update seed data if needed
4. Update API endpoints in `src/`

## 🌱 Seed Data

The seed script creates:
- 4 product categories (Naruto, One Piece, Dragon Ball, Demon Slayer)
- 5 sample products with customization options
- Admin and customer test accounts
- Customization options for each product

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `PORT` | Server port | ❌ (default: 3000) |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `MOMO_API_KEY` | MoMo payment gateway key | ❌ |
| `ZALOPAY_API_KEY` | ZaloPay payment gateway key | ❌ |
| `VNPAY_API_KEY` | VNPAY payment gateway key | ❌ |

## 📝 Notes

- **Migrations vs Push**: Use migrations for production, push for development
- **Seeding**: Always run after schema changes to maintain test data
- **Prisma Studio**: Use `npm run db:studio` to inspect database visually
- **Environment**: Never commit `.env` file (already in `.gitignore`)

## 🚨 Troubleshooting

### Common Issues

1. **Connection refused**: Check if PostgreSQL is running
2. **Role does not exist**: Create database user first
3. **Migration conflicts**: Reset database with `npm run db:reset`
4. **Seed errors**: Check if tables exist, run migrations first

### Reset Everything
```bash
npm run db:reset
npm run db:seed
``` 