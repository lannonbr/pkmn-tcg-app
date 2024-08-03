FROM node:20-alpine

WORKDIR /opt

RUN apk update
RUN apk add sqlite

COPY . .
RUN npm install

ENTRYPOINT [ "/opt/docker-entrypoint.sh" ]
