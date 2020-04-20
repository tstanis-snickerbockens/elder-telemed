To Release a new Speech Relay

Choose a new version number.  Examples below use version number 1.0

gcloud auth configure-docker

docker build --tag speach_relay .
docker tag speach_relay gcr.io/elder-telemed/speach_relay
docker push gcr.io/elder-telemed/speach_relay

To run locally you will need to download a service account key and then:

docker run -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/service_account.json -v /tmp/service_account.json:/tmp/service_account.json:ro --publish 8443:8443 --detach --name sr speach_relay:latest