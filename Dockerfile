FROM mhart/alpine-node:slim-14

ENV APP_WORKDIR=/opt/app/

RUN apk update && apk upgrade && \
    apk add --virtual build-deps git gcc make g++ py-pip curl --no-cache \
        nodejs \
        yarn


COPY package*.json $APP_WORKDIR
RUN yarn global add nodemon

WORKDIR $APP_WORKDIR
RUN yarn install && mv /opt/app/node_modules /node_modules
#RUN yarn install

COPY . $APP_WORKDIR

RUN export PORT=5005

CMD yarn start
