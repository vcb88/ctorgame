# Environment Configuration Guide

## Overview

This document describes all environment variables used in the project, their purpose, and configuration for different environments.

## Core Variables

### Server Configuration
```env
NODE_ENV=production|development # Application environment
PORT=3000                      # Server port
```

### Redis Configuration
```env
REDIS_URL=redis://redis:6379   # Redis connection URL
REDIS_PREFIX=ctorgame:prod:    # Key prefix for Redis
REDIS_PASSWORD=                # Redis password (if required)
```

### MongoDB Configuration
```env
# Root MongoDB user (for initial setup)
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=change_this_password

# Application MongoDB user
MONGO_APP_USER=ctorgame
MONGO_APP_PASSWORD=change_this_password_too

# MongoDB connection URL
MONGODB_URL=mongodb://ctorgame:password@mongodb:27017/ctorgame?authSource=ctorgame
```

### Storage Configuration
```env
STORAGE_PATH=/data/games       # Path for game data storage
```

### Docker Configuration
```env
CLIENT_TAG=ctorgame-client:latest  # Client Docker image tag
SERVER_TAG=ctorgame-server:latest  # Server Docker image tag
```

### Client Configuration
```env
VITE_API_URL=http://api.ctorgame.com  # API URL for client
VITE_HOST=0.0.0.0                     # Dev server host (development only)
```

## Environment-Specific Configuration

### Production Environment
Required in `.env`:
- Secure passwords for MongoDB users
- Redis password if enabled
- Valid SSL-enabled API URL
- Production Docker image tags

Example `.env`:
```env
NODE_ENV=production
PORT=3000
REDIS_URL=redis://redis:6379
REDIS_PREFIX=ctorgame:prod:
REDIS_PASSWORD=secure_redis_password

# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=secure_root_password
MONGO_APP_USER=ctorgame
MONGO_APP_PASSWORD=secure_app_password
MONGODB_URL=mongodb://ctorgame:secure_app_password@mongodb:27017/ctorgame?authSource=ctorgame

# Storage
STORAGE_PATH=/data/games

# Docker
CLIENT_TAG=ctorgame-client:1.0.0
SERVER_TAG=ctorgame-server:1.0.0

# Client
VITE_API_URL=https://api.ctorgame.com
```

### Development Environment
Required in `.env.dev`:
- Local development URLs
- Development prefixes for Redis
- Simplified MongoDB configuration

Example `.env.dev`:
```env
NODE_ENV=development
PORT=3000
REDIS_URL=redis://redis:6379
REDIS_PREFIX=ctorgame:dev:
MONGODB_URL=mongodb://mongodb:27017
STORAGE_PATH=/data/games
VITE_API_URL=http://localhost:3000
VITE_HOST=0.0.0.0
```

## Environment Variables Details

### Server Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | Yes | - | Application environment |
| PORT | Yes | 3000 | Server port |
| REDIS_URL | Yes | - | Redis connection URL |
| REDIS_PREFIX | Yes | - | Redis key prefix |
| REDIS_PASSWORD | No | - | Redis authentication |
| MONGODB_URL | Yes | - | MongoDB connection URL |
| STORAGE_PATH | Yes | /data/games | Game data storage path |

### Client Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_API_URL | Yes | - | API endpoint URL |
| VITE_HOST | Dev only | 0.0.0.0 | Development host |

### Docker Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| CLIENT_TAG | Yes | latest | Client image tag |
| SERVER_TAG | Yes | latest | Server image tag |

## Usage in Different Environments

### Production Launch
```bash
# Copy example file
cp .env.example .env

# Edit with secure values
nano .env

# Start services
docker-compose up -d
```

### Development Launch
```bash
# Copy example file
cp .env.dev.example .env.dev

# Edit if needed
nano .env.dev

# Start development environment
docker-compose -f docker-compose.dev.yml up
```

## Security Considerations

1. Production Environment
   - Use strong passwords
   - Enable Redis authentication
   - Use SSL for all external connections
   - Restrict MongoDB user permissions
   - Use specific Docker image tags

2. Development Environment
   - Keep development data separate (Redis prefixes)
   - Use different MongoDB databases
   - Disable authentication for faster development

## Troubleshooting

### Common Issues

1. Redis Connection Error
   ```
   Error: Redis connection failed
   ```
   - Check REDIS_URL format
   - Verify Redis service is running
   - Check REDIS_PASSWORD if authentication is enabled

2. MongoDB Connection Error
   ```
   MongoServerError: Authentication failed
   ```
   - Verify MONGODB_URL format
   - Check user credentials
   - Ensure database and user exist

3. Client API Connection Error
   ```
   Failed to fetch API endpoint
   ```
   - Check VITE_API_URL value
   - Verify server is running
   - Check for CORS configuration

## Notes

1. Environment Files
   - Never commit .env files
   - Always use example files as templates
   - Document all custom variables

2. Security
   - Rotate passwords regularly
   - Use strong passwords
   - Limit database user permissions

3. Development
   - Use .env.dev for local development
   - Keep development data isolated
   - Use meaningful Redis prefixes

Last updated: January 14, 2025