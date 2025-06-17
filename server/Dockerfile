# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.12.1
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app

ENV NODE_ENV="production"

FROM base AS build

# Install build dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Prune dev dependencies but keep iconv-lite
RUN npm prune --omit=dev

FROM base

# Install runtime dependencies for scraper
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=build /app /app

# Expose port
EXPOSE 80

# Start the application
CMD ["npm", "run", "start"]
