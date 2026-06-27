# Photocation backend — production image.
# Build context must be the backend/ directory.
FROM node:22-bookworm-slim

WORKDIR /app

# Prisma needs OpenSSL at runtime.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Generate the Prisma client and compile TypeScript against the Postgres schema.
RUN npx prisma generate --schema=prisma/schema.prod.prisma \
  && npm run build

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Apply the schema to the database, then start the API.
CMD ["sh", "-c", "npx prisma db push --schema=prisma/schema.prod.prisma --skip-generate && node dist/server.js"]
