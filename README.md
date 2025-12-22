# Curafile Backend

A scalable, production-ready backend API built with Node.js, TypeScript, PostgreSQL, and Docker.

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Containerization**: Docker & Docker Compose
- **Validation**: Zod
- **Logging**: Winston
- **Security**: Helmet, CORS

## Project Structure

```
curafile-backend/
├── src/
│   ├── config/              # Configuration files
│   ├── modules/             # Feature-based modules
│   │   └── health/          # Health check module
│   ├── shared/              # Shared utilities
│   │   ├── middlewares/     # Global middlewares
│   │   ├── utils/           # Helper functions
│   │   ├── types/           # TypeScript types
│   │   ├── exceptions/      # Custom errors
│   │   └── constants/       # Shared constants
│   ├── database/            # Database related files
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── prisma/                  # Prisma schema & migrations
├── docker/                  # Docker files
└── tests/                   # Test files
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd curafile-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL with Docker**
   ```bash
   docker-compose up -d postgres
   ```

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

6. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

The server will start at [http://localhost:3000](http://localhost:3000)

### Using Docker (Recommended)

**Development Mode:**

Run both PostgreSQL and Node.js app in Docker:

```bash
# Start all services (PostgreSQL + Node.js app)
docker compose up

# Run in detached mode
docker compose up -d

# View logs
docker compose logs -f app

# Stop all services
docker compose down
```

**Production Mode:**

```bash
# Build and run production containers
docker compose -f docker-compose.prod.yml up -d

# View production logs
docker compose -f docker-compose.prod.yml logs -f app

# Stop production services
docker compose -f docker-compose.prod.yml down
```

The app will be available at `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations (dev) |
| `npm run prisma:migrate:prod` | Run database migrations (production) |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run lint` | Lint code |
| `npm run lint:fix` | Lint and fix code |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests |

## API Endpoints

### Health Check
- **GET** `/api/health` - Check service health

Returns:
```json
{
  "status": "ok",
  "service": "curafile-backend",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

## Database Migrations

### Create a new migration
```bash
npm run prisma:migrate
```

### Apply migrations to production
```bash
npm run prisma:migrate:prod
```

### Reset database (development only)
```bash
npx prisma migrate reset
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `APP_PORT` | Server port | `3000` |
| `APP_NAME` | Application name | `curafile-backend` |
| `APP_VERSION` | Application version | `1.0.0` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | CORS allowed origin | `*` |
| `LOG_LEVEL` | Logging level | `info` |

## Error Handling

The application includes global error handling for:
- Custom application errors
- Zod validation errors
- Prisma database errors
- 404 not found errors

All errors return a consistent JSON structure:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message",
  "errors": []
}
```

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Production

```bash
docker build -t curafile-backend --target production .
docker run -p 3000:3000 curafile-backend
```

### Cloud Deployment

1. Set up environment variables in your cloud provider
2. Run migrations: `npm run prisma:migrate:prod`
3. Build and deploy the Docker container

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

ISC
