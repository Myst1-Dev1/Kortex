FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4002 4003 4004 4005 4006 4007 4008

CMD ["npm", "run", "start:dev"]