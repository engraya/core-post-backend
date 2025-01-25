FROM node:alpine3.20

WORKDIR /app

COPY package.json .

RUN npm install 

COPY ./src .

EXPOSE 4000

CMD [ "node", "index.ts" ]

