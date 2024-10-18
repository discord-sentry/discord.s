FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ pkgconfig pixman-dev cairo-dev pango-dev jpeg-dev librsvg-dev

COPY package*.json ./
RUN npm ci --silent

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

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

COPY package*.json ./
RUN npm install --silent

RUN npm install -g tsx

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/utils ./utils 

COPY .env .env

EXPOSE 4596

CMD ["sh", "-c", "npm start & sleep 5 && tsx scripts/run-updater.ts"]
