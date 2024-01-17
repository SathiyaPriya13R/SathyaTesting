FROM node:20.11.0-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json ./

# Bundle app source
COPY . /usr/src/app

RUN ls -a
RUN node --version

RUN npm install

EXPOSE 3000

CMD ["npm", "start", "--host", "0.0.0.0"]
