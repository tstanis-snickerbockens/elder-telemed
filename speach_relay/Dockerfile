FROM maven:3.6-jdk-11-openj9

WORKDIR /usr/src/app

COPY src/ ./src/
COPY jetty* ./
COPY pom.xml .
COPY webdefault.xml .
RUN ls -laR
CMD [ "mvn", "clean", "jetty:run" ]

EXPOSE 8443