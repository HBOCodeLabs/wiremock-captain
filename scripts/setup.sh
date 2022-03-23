#!/bin/bash

set -e

mkdir -p "$PWD"/extensions

curl -H "Accept: application/zip" https://repo1.maven.org/maven2/org/wiremock/wiremock-webhooks-extension/2.31.0/wiremock-webhooks-extension-2.31.0.jar -o "$PWD"/extensions/wiremock-webhooks-extension-2.31.0.jar

docker run -itd --rm --name wiremock-container -p 8080:8080 -v "$PWD"/extensions:/var/wiremock/extensions wiremock/wiremock:2.31.0 --record-mappings --verbose --extensions org.wiremock.webhooks.Webhooks

docker ps --filter "name=wiremock-container"
