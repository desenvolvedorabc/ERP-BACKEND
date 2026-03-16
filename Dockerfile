# Docker multistage builds https://earthly.dev/blog/docker-multistage/

# First stage

FROM node:20-alpine as first-stage

RUN apk add --no-cache git

WORKDIR /usr/src/app

COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

RUN yarn add glob rimraf

RUN yarn --frozen-lockfile

COPY --chown=node:node . .

# Second stage

FROM node:20-alpine as second-stage
RUN apk add --no-cache git

WORKDIR /usr/src/app

COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

COPY --chown=node:node --from=first-stage /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn build
RUN yarn install --production

#Builder for gcsfuse binaries

FROM golang:1.24-alpine as builder

RUN apk add git

RUN git clone https://github.com/GoogleCloudPlatform/gcsfuse.git

WORKDIR ./gcsfuse

RUN go install ./tools/build_gcsfuse
RUN build_gcsfuse . /tmp $(git log -1 --format=format:"%H")

# Final stage

FROM node:20-alpine as final-stage
RUN apk add --no-cache git

WORKDIR /usr/src/app

# Install system dependencies
RUN set -e; \
    apk update && apk add \
    fuse;

RUN apk add --no-cache tini

COPY --from=builder /tmp/bin/gcsfuse /usr/bin
COPY --from=builder /tmp/sbin/mount.gcsfuse /usr/sbin
RUN ln -s /usr/sbin/mount.gcsfuse /usr/sbin/mount.fuse.gcsfuse

# Copy the statup script
COPY gcsfuse_run.sh ./gcsfuse_run.sh
RUN chmod +x ./gcsfuse_run.sh

COPY --chown=node:node --from=second-stage /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=second-stage /usr/src/app/dist ./dist

# Use tini to manage zombie processes and signal forwarding
# https://github.com/krallin/tini
ENTRYPOINT ["/sbin/tini", "--"]

# Run the web service on container startup.
CMD ["./gcsfuse_run.sh"]
