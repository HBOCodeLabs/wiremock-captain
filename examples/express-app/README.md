# express-app demo project

## Description

This directory contains a lightweight express application that does an external API call.
For purposes of testing the complete service flow, wiremock-captain is used to mock the external
API call.

## Setup & Run

Launching the application:

```shell
npm install
npm run dev
```

Running the tests:

```bash
docker run -itd --rm -p 8080:8080 --name mocked-service rodolpheche/wiremock:2.27.2 --verbose
npm run test
```
