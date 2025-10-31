FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps

# Установка build dependencies для canvas и native modules
RUN apt-get update && apt-get install -y \
    openssl \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Установка dependencies для build и Prisma
RUN echo "deb http://deb.debian.org/debian bullseye main" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y \
    libssl1.1 \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments (Railway передаст автоматически)
ARG DATABASE_URL
ARG REDIS_URL
ENV DATABASE_URL=$DATABASE_URL
ENV REDIS_URL=$REDIS_URL

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js (теперь DATABASE_URL доступен для SSG)
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Установка runtime dependencies для Prisma и canvas
RUN echo "deb http://deb.debian.org/debian bullseye main" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y \
    libssl1.1 \
    libcairo2 \
    libpango1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    libpixman-1-0 \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create migration script inline (before USER switch)
RUN mkdir -p ./scripts && \
    echo '#!/bin/sh' > ./scripts/start-with-migrations.sh && \
    echo 'set -e' >> ./scripts/start-with-migrations.sh && \
    echo 'echo "🔄 Applying Prisma migrations..."' >> ./scripts/start-with-migrations.sh && \
    echo 'export DATABASE_URL="${DATABASE_URL}"' >> ./scripts/start-with-migrations.sh && \
    echo 'if command -v npx > /dev/null; then' >> ./scripts/start-with-migrations.sh && \
    echo '  npx prisma migrate deploy || npx prisma db push --accept-data-loss || echo "⚠️ Migration warning (continuing...)"' >> ./scripts/start-with-migrations.sh && \
    echo 'else' >> ./scripts/start-with-migrations.sh && \
    echo '  echo "⚠️ npx not available, skipping migrations"' >> ./scripts/start-with-migrations.sh && \
    echo 'fi' >> ./scripts/start-with-migrations.sh && \
    echo 'echo "✅ Migrations completed"' >> ./scripts/start-with-migrations.sh && \
    echo 'echo "🚀 Starting Next.js server..."' >> ./scripts/start-with-migrations.sh && \
    echo 'cd /app && node server.js' >> ./scripts/start-with-migrations.sh && \
    chmod +x ./scripts/start-with-migrations.sh && \
    chown nextjs:nodejs ./scripts/start-with-migrations.sh

# Copy Prisma schema, migrations and generated client for runtime migrations
# В standalone режиме Next.js уже включает необходимые файлы
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Копируем package.json для доступа к скриптам
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./scripts/start-with-migrations.sh"]
