FROM node:20-bookworm-slim

ENV NODE_ENV=production

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