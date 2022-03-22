#!/bin/bash

mkdir "$PWD"/extensions

curl -H "Accept: application/zip" https://repo1.maven.org/maven2/org/wiremock/wiremock-webhooks-extension/2.31.0/wiremock-webhooks-extension-2.31.0.jar -o "$PWD"/extensions/wiremock-webhooks-extension-2.31.0.jar

docker network create wiremock-net

docker run -itd --rm --name wiremock-container-one -p 8080:8080 --network wiremock-net -v "$PWD"/extensions:/var/wiremock/extensions wiremock/wiremock:2.31.0 --record-mappings --verbose --extensions org.wiremock.webhooks.Webhooks

docker run -itd --rm --name wiremock-container-two -p 8081:8080 --network wiremock-net wiremock/wiremock:2.31.0 --record-mappings --verbose

docker ps --filter "name=wiremock-container"
