# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Chromium for the build-time prerenderer (scripts/prerender-games.mjs, run as
# part of `npm run build`). puppeteer-core drives this instead of downloading
# its own Chromium, since a glibc-built Chromium binary won't run on Alpine's
# musl libc -- Alpine's own `chromium` apk package is built for it.
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies with clean install
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_ADMIN_CODE
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ADMIN_CODE=$VITE_ADMIN_CODE
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

# Build the application with production optimizations
RUN npm run build

# Production stage - minimal image
FROM node:20-alpine

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

# Start the application with production-optimized settings.
# NOTE: intentionally NOT using `-s` (single-page/SPA mode) here -- that flag
# rewrites *every* unmatched path (including /robots.txt, /sitemap.xml,
# /favicon.ico, and genuinely-nonexistent paths) to index.html, which made
# every URL on the site byte-identical and crawlers unable to see any real
# content. Real static files (robots.txt, sitemap.xml, and any prerendered
# dist/game/<id>/index.html from scripts/prerender-games.mjs) now serve as
# themselves; any other path falls through to `serve`'s built-in dist/404.html
# handling (a copy of the SPA shell, served with a real 404 status) so the
# client-side app can still take over for games that weren't prerendered.
CMD ["serve", "dist", "-l", "8080", "--no-clipboard", "--no-port-switching"]
