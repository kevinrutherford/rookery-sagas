FROM node:18.18-alpine AS node
ENV NODE_OPTIONS="--unhandled-rejections=strict --enable-source-maps"
WORKDIR /app

COPY .npmrc \
  package.json \
  package-lock.json \
  ./

# Stage: Development NPM install - - - - - - - - - - - - - - - - - - - - - - - -
#
FROM node AS npm-dev

RUN npm ci

# Stage: Production build - - - - - - - - - - - - - - - - - - - - - - - - - - -
#
FROM node AS build-prod
ENV NODE_ENV=production

COPY tsconfig.json .
COPY --from=npm-dev /app/ .
COPY src/ src/

RUN npx tsc

# Stage: Production NPM install - - - - - - - - - - - - - - - - - - - - - - - -
#
FROM node AS npm-prod

RUN npm ci --production

# Stage: Production environment - - - - - - - - - - - - - - - - - - - - - - - -
#
FROM node AS prod
ENV NODE_ENV=production

COPY --from=npm-prod /app/ .
COPY --from=build-prod /app/build/ build/

EXPOSE 44002
CMD ["node", "./build/index.js"]

