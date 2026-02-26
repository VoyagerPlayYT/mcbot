FROM node:18-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN apt-get update && apt-get install -y python3 make g++
RUN npm install
COPY . .
CMD ["npm", "start"]
