FROM node:20-alpine

WORKDIR /app

# Install deps (this layer is cached unless package*.json changes).
COPY package*.json ./
RUN npm ci

# Copy source.
COPY backend ./backend
COPY tsconfig.json types.d.ts ./

# Generate the Prisma client against the schema in the image.
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# tsx runs ESM TypeScript directly - no separate compile step needed.
RUN npm install -g tsx

EXPOSE 5001

CMD ["tsx", "backend/src/server.ts"]
