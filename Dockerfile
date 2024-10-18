# Stage 1: Build the Next.js app and compile TypeScript
FROM node:18-alpine AS builder

WORKDIR /app

# Install Python and build dependencies required for node-gyp
RUN apk add --no-cache python3 make g++ pkgconfig pixman-dev cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy the rest of the app's source code
COPY . .

# Build the Next.js app and TypeScript files
RUN npm run build
RUN npm run start-updater

# Stage 2: Run the app and updater
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies along with Python and other build tools
RUN apk add --no-cache python3 make g++ pkgconfig pixman-dev cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts

# Expose the port the app runs on
EXPOSE 4596

# Start both the Next.js app and the precompiled updater script using concurrently
CMD ["npx", "concurrently", "npm:start", "node", "scripts/run-updater.js"]
