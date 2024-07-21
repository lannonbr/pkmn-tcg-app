FROM node:20-alpine

WORKDIR /opt

RUN apk update
RUN apk add sqlite3

COPY . .
RUN npm install

ENTRYPOINT [ "startup.sh" ]
