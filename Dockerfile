# Multi-stage build for ChatApp

# ----- Build Stage -----
FROM node:18 AS builder
WORKDIR /app

# Install root dependencies and workspaces
COPY package.json package-lock.json* ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm install

# Copy source code
COPY . .

# Build client and server
RUN npm run build

# Remove development dependencies to reduce size
RUN npm prune --omit=dev --workspaces

# ----- Production Stage -----
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/client/package.json ./client/package.json
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/node_modules ./client/node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "server/dist/index.js"]
