FROM node:20-alpine AS frontend  
RUN mkdir -p /app/node_modules && chown -R node:node /app

WORKDIR /app 
COPY --chown=node:node ./package*.json ./  
USER node
RUN npm install
COPY --chown=node:node . .  
WORKDIR /app
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
