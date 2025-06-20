# stage 1: base image
ARG NODE_VERSION=24.2.0
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app
ENV NODE_ENV="production"

# stage 2: build
FROM base AS build

COPY package*.json ./

RUN npm ci

# Copy app
COPY . .

# Build step
RUN npm run build

# stage 3: production runtime (no dev deps)
FROM base

COPY package*.json ./
RUN npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start"]
