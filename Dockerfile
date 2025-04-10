FROM node:23-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4004
CMD ["npm", "start"]