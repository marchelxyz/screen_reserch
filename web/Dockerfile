FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci

FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY . .

RUN npm run db:generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["sh", "-c", "npm run db:setup && npm run start"]

