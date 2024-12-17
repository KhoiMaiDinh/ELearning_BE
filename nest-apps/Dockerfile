##################
# BUILD BASE IMAGE
##################

FROM node:20-alpine AS base

# Install and use pnpm
RUN npm install -g pnpm@9.11.0

#############################
# BUILD FOR LOCAL DEVELOPMENT
#############################

FROM base AS development
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app
RUN chown -R node:node /app


COPY --chown=node:node package*.json ./

# Install all dependencies (including devDependencies)
RUN pnpm install

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

#####################
# BUILD BUILDER IMAGE
#####################

FROM base AS builder
ARG APP
WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node --from=development /app/apps ./apps
COPY --chown=node:node --from=development /app/libs ./libs
COPY --chown=node:node --from=development /app/proto ./proto
COPY --chown=node:node --from=development /app/tsconfig.json ./tsconfig.json
COPY --chown=node:node --from=development /app/tsconfig.build.json ./tsconfig.build.json
COPY --chown=node:node --from=development /app/nest-cli.json ./nest-cli.json

RUN pnpm build ${APP}

# Removes unnecessary packages adn re-install only production dependencies
ARG NODE_ENV=production 
ENV NODE_ENV=${NODE_ENV} 
RUN pnpm prune --prod
RUN pnpm install --prod

USER node

######################
# BUILD FOR PRODUCTION
######################

FROM node:20-alpine AS production
ARG APP
WORKDIR /app

RUN mkdir -p src/generated && chown -R node:node src

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package.json ./

USER node

# Start the server using the production build
ENV APP_MAIN_FILE=dist/apps/${APP}/src/main
CMD node ${APP_MAIN_FILE} 
