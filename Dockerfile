FROM node:22-slim AS build
WORKDIR /app
COPY apps/api/package*.json ./
RUN npm ci
COPY apps/api/ .
RUN npm run build

FROM node:22-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY apps/api/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY apps/api/src/db/migrations ./src/db/migrations
EXPOSE 4000
CMD ["node", "dist/index.js"]
