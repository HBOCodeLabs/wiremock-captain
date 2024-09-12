#!/bin/bash

set -e

mkdir -p "$PWD"/extensions

curl -H "Accept: application/zip" https://repo1.maven.org/maven2/org/wiremock/wiremock-webhooks-extension/2.31.0/wiremock-webhooks-extension-2.31.0.jar -o "$PWD"/extensions/wiremock-webhooks-extension-2.31.0.jar

docker stop wiremock-container || true && docker rm wiremock-container || true

docker run -itd --rm --name wiremock-container -p 8080:8080 --add-host host.docker.internal:host-gateway -v "$PWD"/extensions:/var/wiremock/extensions wiremock/wiremock:3.9.1 --record-mappings --verbose --extensions org.wiremock.webhooks.Webhooks

docker ps --filter "name=wiremock-container"
