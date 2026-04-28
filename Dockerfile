FROM node:20-bookworm-slim

ENV NODE_ENV=production

# Prisma needs OpenSSL at runtime. bookworm-slim doesn't include it by default
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY backend ./backend
COPY tsconfig.json types.d.ts ./

# Generate Prisma client for the container
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

EXPOSE 5001

CMD ["npx", "tsx", "backend/src/server.ts"]