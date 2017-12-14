FROM node:alpine
#FROM node:boron

# create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

#VOLUME ["/usr/src/app/conf"]

# Set the default working directory as the installation directory.
#WORKDIR /usr/src/app


#EXPOSE 8080
EXPOSE 10080
CMD [ "npm", "start" ]