
FROM node:20

WORKDIR /app

COPY ./package.json ./
RUN npm install

COPY ./ ./

RUN mkdir -p uploads

RUN npm run build

CMD ["node", "dist/index.js"]