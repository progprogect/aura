#!/bin/sh
set -e

echo "🔄 Applying Prisma migrations..."
npx prisma migrate deploy || npx prisma db push --accept-data-loss

echo "✅ Migrations applied successfully"
echo "🚀 Starting Next.js server..."
exec node server.js

