# Dockerfile for Next.js On-Premise Service
# Use official Node.js image as base
FROM node:20-slim

# Set working directory
WORKDIR /app

# Upgrade system packages for security
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Copy package.json and lock file
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

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
