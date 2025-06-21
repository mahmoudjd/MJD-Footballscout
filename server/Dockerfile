FROM node:24.2.0-slim

RUN mkdir -p /opt/app

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY src/ ./src

RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]
