# Stage 1: Build the Next.js app
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy the rest of the app's source code
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Run the app and updater
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies
COPY package*.json ./
RUN npm ci --only=production --silent

# Install TypeScript and ts-node for the updater script
RUN npm install typescript ts-node concurrently --silent

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts

# Expose the port the app runs on
EXPOSE 4596

# Start both the Next.js app and the updater script using concurrently
CMD ["npx", "concurrently", "npm:start", "npm:start-updater"]
