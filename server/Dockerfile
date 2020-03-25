FROM kurento/kurento-media-server

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs git build-essential gcc g++ make

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8443
EXPOSE 8888
ENTRYPOINT ["./combined-entrypoint.sh"]
