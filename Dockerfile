# Stage 1: Build the Next.js app and compile TypeScript
FROM node:18-alpine AS builder

WORKDIR /app

# Install Python and build dependencies required for node-gyp
RUN apk add --no-cache python3 make g++ pkgconfig pixman-dev cairo-dev pango-dev jpeg-dev librsvg-dev

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy the rest of the app's source code, including .env.local
COPY . .

# Build the Next.js app and TypeScript files
RUN npm run build

# Stage 2: Run the app and updater
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies along with Python, other build tools, and fonts
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    librsvg-dev \
    fontconfig \
    ttf-dejavu \
    ttf-liberation \
    ttf-freefont \
    font-noto

# Install production dependencies
COPY package*.json ./
RUN npm install --silent

# Install global package: tsx (removed chalk)
RUN npm install -g tsx

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/utils ./utils 

# Copy the .env file
COPY .env .env

# Expose the port the app runs on
EXPOSE 4596

CMD ["sh", "-c", "npm start & sleep 5 && tsx scripts/run-updater.ts"]
