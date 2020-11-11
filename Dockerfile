#Defines base image
FROM node:lts-alpine

#Creates path for node_modules
RUN mkdir -p /home/node/api/node_modules

#Setting default directory
WORKDIR /home/node/api

#Installs bash
RUN apk update && apk add bash

#Copies package.json and yarn file to container
COPY package.json yarn.* tsconfig.json  ./

#Installs dependencies
RUN yarn

#Copies rest of code
COPY  . .

#Exposes port
EXPOSE 3333

#Executes the commands bellow
CMD ["yarn", "start"]
