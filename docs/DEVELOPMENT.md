# Development Guide

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **pnpm**: 8.x or higher
- **PostgreSQL**: 16.x
- **Redis**: 7.x
- **Docker**: (optional, for database)

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd fintrack-pro

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your settings

# 4. Start database (Docker)
docker-compose up -d postgres redis

# 5. Run migrations
cd backend
pnpm migration:run

# 6. Start development servers
cd ..
pnpm dev
```

## 📁 Project Structure

```
fintrack-pro/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication & JWT
│   │   ├── users/       # User management
│   │   ├── expenses/    # Expense tracking
│   │   ├── income/      # Income tracking
│   │   ├── perimeters/  # Categories/Perimeters
│   │   ├── friends/     # Friend system
│   │   ├── analytics/   # Analytics & Dashboard
│   │   ├── notifications/ # Notifications
│   │   └── common/      # Shared modules
│   └── test/            # Tests
├── frontend/            # Next.js App
│   ├── app/            # App Router pages
│   ├── components/     # React components
│   │   ├── ui/        # shadcn/ui components
│   │   ├── features/  # Feature components
│   │   └── layout/    # Layout components
│   ├── lib/           # Utilities
│   ├── hooks/         # Custom hooks
│   └── stores/        # Zustand stores
├── shared/            # Shared types
└── docs/              # Documentation
```

## 🛠️ Development Workflow

### Running Development

```bash
# Start all services
pnpm dev

# Start backend only
pnpm dev:backend

# Start frontend only
pnpm dev:frontend
```

### Testing

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Generate coverage
pnpm test:coverage
```

### Linting

```bash
# Check code style
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Format code
pnpm format
```

### Database

```bash
# Generate migration
cd backend
pnpm migration:generate src/database/migrations/MigrationName

# Run migrations
pnpm migration:run

# Revert last migration
pnpm migration:revert

# Seed database
pnpm seed
```

## 🏗️ Building

```bash
# Build all
pnpm build

# Build backend
pnpm build:backend

# Build frontend
pnpm build:frontend
```

## 📝 Code Style Guide

### TypeScript

- Use **TypeScript** for all files
- Enable **strict mode**
- Define **interfaces** for all data structures
- Use **type safety** everywhere

### Naming Conventions

- **Files**: kebab-case (`user.service.ts`)
- **Classes**: PascalCase (`UserService`)
- **Functions**: camelCase (`findUser`)
- **Constants**: UPPER_SNAKE_CASE (`JWT_SECRET`)
- **Interfaces**: PascalCase (`User`)
- **Types**: PascalCase (`ApiResponse`)

### Backend (NestJS)

```typescript
// Use dependency injection
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
}

// Use DTOs for validation
export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}

// Use proper error handling
throw new NotFoundException('User not found');
```

### Frontend (React)

```typescript
// Use functional components
export function Dashboard() {
  const [data, setData] = useState<DashboardData>();

  return <div>...</div>;
}

// Use custom hooks
export function useDashboard() {
  return useQuery(['dashboard'], fetchDashboard);
}

// Use Zustand for state
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
}));
```

## 🎨 Design System

### Colors

```tsx
// Primary gradient
<div className="aurora-gradient">...</div>

// Glassmorphism
<div className="glass rounded-2xl p-6">...</div>

// Theme-aware
<div className="bg-background text-foreground">...</div>
```

### Typography

```tsx
// Headings (Satoshi)
<h1 className="font-satoshi text-4xl font-bold">...</h1>

// Body (DM Sans)
<p className="font-sans text-base">...</p>
```

### Spacing (8px grid)

- `4px`: `p-1`, `m-1`
- `8px`: `p-2`, `m-2`
- `16px`: `p-4`, `m-4`
- `24px`: `p-6`, `m-6`
- `32px`: `p-8`, `m-8`

## 🔐 Security Guidelines

1. **Never commit secrets** to git
2. Use **environment variables** for sensitive data
3. Implement **rate limiting** on all endpoints
4. Validate **all user input**
5. Use **prepared statements** for SQL
6. Enable **CSRF protection**
7. Implement **proper authentication**
8. Use **HTTPS** in production
9. Keep **dependencies updated**
10. Run **security scans** regularly

## 📊 Performance Guidelines

### Backend

- Cache frequently accessed data in **Redis**
- Use **pagination** for large datasets
- Create **database indexes** on frequently queried fields
- Implement **CQRS** for read-heavy operations
- Use **WebSocket** for real-time updates

### Frontend

- Use **React Query** for server state caching
- Implement **optimistic updates**
- Use **code splitting** and lazy loading
- Optimize **images** and assets
- Use **Lighthouse** for performance monitoring
- Target: **LCP < 1.8s**, **FCP < 1.2s**, **TTI < 3s**

## 🐛 Debugging

### Backend

```bash
# Debug mode
pnpm start:debug

# Then in VSCode, attach to Node process
```

### Frontend

```bash
# React DevTools
# Redux DevTools (if using Redux)
# Network tab for API calls
```

## 📦 Dependencies Management

```bash
# Add dependency
pnpm add <package>

# Add dev dependency
pnpm add -D <package>

# Update dependencies
pnpm update

# Check for outdated
pnpm outdated
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [React Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🤝 Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Write tests
4. Ensure all tests pass
5. Create a pull request
6. Get code review approval
7. Merge to `develop`

## ❓ Troubleshooting

### Database connection issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres
```

### Port already in use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module not found

```bash
# Clear cache and reinstall
rm -rf node_modules
pnpm install
```
