FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY apps/on-prem-app/license-init.mjs /app/license-init.mjs
COPY apps/on-prem-app/license_public.pem /app/config/license_public.pem
COPY apps/on-prem-app/LICENSE.txt /app/LICENSE.txt
EXPOSE 3000
CMD ["sh", "-c", "node /app/license-init.mjs && node server.js"]
