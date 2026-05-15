# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for environment variables
ARG VITE_API_URL
ARG VITE_APP_NAME
ARG VITE_APP_URL
ARG VITE_ENABLE_ANALYTICS
ARG VITE_ENABLE_ERROR_REPORTING
ARG VITE_ENABLE_NOTIFICATIONS
ARG VITE_ENABLE_PREMIUM_FEATURES
ARG VITE_ENABLE_REAL_TIME_CHAT
ARG VITE_DEBUG_MODE
ARG VITE_LOG_LEVEL

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config if exists
COPY nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || echo "Using default nginx config"

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 