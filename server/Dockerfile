FROM kurento/kurento-media-server

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs git build-essential gcc g++ make
RUN npm install --global bower

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080
EXPOSE 8888

ENV KMS_EXTERNAL_ADDRESS 35.223.250.231

ENTRYPOINT ["/usr/src/app/combined-entrypoint.sh"]
