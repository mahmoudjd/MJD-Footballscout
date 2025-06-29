FROM node:24-alpine

RUN apk add --no-cache ca-certificates

RUN mkdir -p /opt/app

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY src/ ./src

RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]
