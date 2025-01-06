# CTORGame Setup Guide

## Prerequisites

### Required Software
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)
- Git

### System Requirements
- Minimum 4GB RAM
- 20GB free disk space
- Modern web browser (Chrome, Firefox, Safari)

## Quick Start with Docker

### 1. Clone Repository
```bash
git clone https://github.com/vcb88/ctorgame.git
cd ctorgame
```

### 2. Environment Setup
```bash
# Copy example environment files
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env

# Edit environment files with your settings
# Most defaults should work for local development
```

### 3. Start with Docker Compose
```bash
# Development environment
docker-compose -f docker-compose.dev.yml up

# Production environment
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:80
- Backend: http://localhost:3000
- Database Admin: http://localhost:8080

## Local Development Setup

### 1. Frontend Setup
```bash
# Install pnpm (if not installed)
npm install -g pnpm

# Install dependencies
cd client
pnpm install

# Start development server
pnpm dev
```

### 2. Backend Setup
```bash
# Create Python virtual environment
cd server
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Start development server
python socketio_server.py
```

### 3. Database Setup
```bash
# Start MongoDB and Redis
docker-compose up -d mongodb redis

# Initialize database
cd server
python -m scripts.init_db
```

## Configuration

### Frontend Environment Variables
```ini
# client/.env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

### Backend Environment Variables
```ini
# server/.env
MONGODB_URL=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
STORAGE_PATH=storage/games
```

### Docker Environment Variables
```ini
# .env
COMPOSE_PROJECT_NAME=ctorgame
MONGODB_PORT=27017
REDIS_PORT=6379
```

## Development Tools

### Code Quality Tools
```bash
# Frontend linting
cd client
pnpm lint
pnpm format

# Backend linting
cd server
flake8
black .
```

### Testing
```bash
# Frontend tests
cd client
pnpm test
pnpm test:e2e

# Backend tests
cd server
pytest
```

### Build
```bash
# Frontend production build
cd client
pnpm build

# Build Docker images
docker-compose build
```

## Common Issues

### Frontend Issues

#### CORS Errors
If you see CORS errors in the console:
1. Check VITE_API_URL in client/.env
2. Verify nginx.conf CORS settings
3. Check server CORS configuration

#### WebSocket Connection Failed
1. Verify VITE_WS_URL in client/.env
2. Check if Socket.IO server is running
3. Verify nginx WebSocket configuration

### Backend Issues

#### MongoDB Connection Failed
1. Check if MongoDB container is running
2. Verify MONGODB_URL environment variable
3. Check MongoDB logs: `docker-compose logs mongodb`

#### Redis Connection Failed
1. Check if Redis container is running
2. Verify REDIS_URL environment variable
3. Check Redis logs: `docker-compose logs redis`

## Production Deployment

### Requirements
- Domain name
- SSL certificate
- MongoDB production instance
- Redis production instance
- File storage solution

### Deployment Steps
1. Update environment variables for production
2. Build production Docker images
3. Push images to registry
4. Deploy using docker-compose or orchestration tool

### SSL Setup
```nginx
# nginx.conf
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Other SSL settings...
}
```

## Monitoring

### Docker Container Monitoring
```bash
# View container logs
docker-compose logs -f

# View container stats
docker stats

# Check container health
docker-compose ps
```

### Application Monitoring
1. MongoDB metrics dashboard
2. Redis monitoring
3. Application logs in /var/log/ctorgame/
4. Nginx access and error logs

## Backup and Recovery

### Database Backup
```bash
# Backup MongoDB
mongodump --uri="mongodb://localhost:27017" --out="backup"

# Backup Redis
redis-cli save
```

### Application Data Backup
```bash
# Backup game files
tar -czf games_backup.tar.gz storage/games/

# Backup environment files
cp .env .env.backup
```

## Security Considerations

### Production Setup
1. Use strong passwords
2. Enable firewall
3. Keep software updated
4. Use SSL/TLS
5. Implement rate limiting

### Database Security
1. Enable MongoDB authentication
2. Set Redis password
3. Regular security updates
4. Backup strategy

## Performance Tuning

### Node.js Settings
```bash
# Environment settings
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=4096"
```

### Nginx Settings
```nginx
# nginx.conf
worker_processes auto;
worker_connections 2048;
keepalive_timeout 65;
```

### MongoDB Settings
```yaml
# mongod.conf
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100
```

## Development Guidelines

### Git Workflow
1. Create feature branch
2. Make changes
3. Run tests
4. Create pull request
5. Code review
6. Merge to main

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Follow Python PEP 8
- Write documentation
- Include tests

### Commit Messages
```
feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
refactor: refactor code
```