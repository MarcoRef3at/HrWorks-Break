FROM node:lts-alpine
FROM mcr.microsoft.com/playwright:focal

ENV HRWORKS_USERNAME=******
ENV EMAIL=******
ENV HRWORKS_PASSWORD=******

WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN apt-get update && apt-get -y install libnss3 libatk-bridge2.0-0 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libatspi2.0-0 libxshmfence-dev
RUN npm install --production --silent && mv node_modules ../
RUN npx playwright install
COPY . .
CMD ["node", "server.js"]