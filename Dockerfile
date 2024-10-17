 # Stage 1: Build the Next.js app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Run the application
FROM node:18-alpine

WORKDIR /app

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts

# Install only production dependencies
RUN npm ci --only=production

# Copy the start-updater script
COPY scripts/run-updater.ts ./scripts/

# Install ts-node for running the updater script
RUN npm install -g ts-node

# Install concurrently to run both processes
RUN npm install concurrently

# Expose the port the app runs on
EXPOSE 4596

# Start both the Next.js app and the updater using concurrently
CMD ["npx", "concurrently", "npm:start", "ts-node ./scripts/run-updater.ts"]
