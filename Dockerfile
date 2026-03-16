# Build stage
FROM node:20-alpine AS build

RUN apk add --no-cache git

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Production stage
FROM node:20-alpine

RUN apk add --no-cache git

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile && yarn cache clean

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3003

CMD ["node", "dist/main"]
