FROM node:15
WORKDIR /app
COPY package.json .
RUN npm install
COPY . ./
EXPOSE 8081
EXPOSE 8082
CMD ["node","index.js"]