# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies with clean install
RUN npm ci --only=production=false && \
    npm cache clean --force

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_GEMINI_API_KEY
ARG VITE_ADMIN_CODE
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_ADMIN_CODE=$VITE_ADMIN_CODE

# Build the application with production optimizations
RUN npm run build

# Production stage - minimal image
FROM node:18-alpine

WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install serve globally for serving static files
RUN npm install -g serve@14 && \
    npm cache clean --force

# Copy built files from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Expose port (Cloud Run uses 8080 by default)
EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application with production-optimized settings
CMD ["serve", "-s", "dist", "-l", "8080", "--no-clipboard", "--no-port-switching"]
