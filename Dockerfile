FROM node:alpine

WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./
RUN npm install -g ts-node

CMD ["npm", "start"]