# 1️⃣ Base image
FROM node:24.2.0-slim AS base

WORKDIR /app
ENV NODE_ENV=production

# 2️⃣ Build stage
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential python-is-python3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy dependencies
COPY package*.json ./
RUN npm ci --include=dev

# Copy source
COPY . .

# Build output
RUN npm run build

# 3️⃣ Final stage
FROM base

WORKDIR /app

# Copy only what's needed:
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 80

CMD ["npm", "run", "start"]
