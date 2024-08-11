FROM node:20-alpine

WORKDIR /opt

LABEL org.opencontainers.image.source https://github.com/lannonbr/pkmn-tcg-app

RUN apk update
RUN apk add sqlite

COPY . .
RUN npm install

ENTRYPOINT [ "/opt/docker-entrypoint.sh" ]
