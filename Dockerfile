FROM node:18-slim  
WORKDIR /usr/src/app  
COPY package*.json ./  

RUN apt-get update && \  
    apt-get install -y \  
    python3 \  
    make \  
    g++ \  
    git \  
    ca-certificates \  
    --no-install-recommends && \  
    rm -rf /var/lib/apt/lists/*  

RUN npm install -g npm@latest && \  
    npm install --production --unsafe-perm  

COPY . .  
CMD ["npm", "start"]  
