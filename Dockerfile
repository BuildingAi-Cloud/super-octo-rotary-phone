# Dockerfile for Next.js On-Premise Service
# Use official Node.js Alpine image as base (smaller, fewer vulnerabilities)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Alpine base: install minimal build dependencies if needed
RUN apk add --no-cache bash

# Copy package.json and lock file
COPY package.json ./
COPY pnpm-lock.yaml ./

# Activate the pnpm version that matches the lockfile format.
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy rest of the application
COPY . .

# Build the Next.js app
RUN pnpm build

# Expose port (default Next.js port)
EXPOSE 3000

# Start the Next.js app
CMD ["pnpm", "start"]
