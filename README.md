<div>
  <br />
    <img width="300" src="https://github.com/HBOCodeLabs/wiremock-captain/blob/main/docs/images/wmc-logo.svg?raw=true">
  <p />
</div>

[![npm](https://img.shields.io/npm/v/wiremock-captain)](https://www.npmjs.com/package/wiremock-captain)
[![npm](https://img.shields.io/npm/dw/wiremock-captain)](https://www.npmjs.com/package/wiremock-captain)
[![Azure DevOps builds](https://img.shields.io/azure-devops/build/HBODigitalProducts/e6cee603-ddc7-43e3-b1a8-e2d6b3f6173c/37)](https://dev.azure.com/HBODigitalProducts/OSS/_build?definitionId=37&branchFilter=1388%2C1388%2C1388%2C1388%2C1388%2C1388%2C1388%2C1388)
[![Azure DevOps coverage](https://img.shields.io/azure-devops/coverage/HBODigitalProducts/OSS/37)](https://dev.azure.com/HBODigitalProducts/OSS/_build?definitionId=37&branchFilter=1388%2C1388%2C1388%2C1388%2C1388%2C1388%2C1388%2C1388)
[![node-current](https://img.shields.io/node/v/wiremock-captain)](https://www.npmjs.com/package/wiremock-captain)
[![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed-raw/HBOCodeLabs/wiremock-captain?color=green)](https://github.com/HBOCodeLabs/wiremock-captain/pulls?q=is%3Apr+is%3Aclosed)
[![GitHub](https://img.shields.io/github/license/HBOCodeLabs/wiremock-captain)](https://github.com/HBOCodeLabs/wiremock-captain/blob/main/LICENSE)

*A better way to use the WireMock API simulator to test your APIs*

<br />

**WireMock Captain** provides an easy interface for testing HTTP-based APIs. Tests are implemented in TypeScript or JavaScript with the Node.js runtime. Mocking is performed by the popular [WireMock](http://wiremock.org) simulator, which typically runs in a Docker container.

- **Why not use in-process mocks?** Unit test mocks have their advantages, but they do not simulate real world API interactions very accurately.  They can be difficult to debug.  During development, you can't interact with them using familiar REST tools.

- **Why not test using a non-production service instance?** Testing with a live service often requires nontrivial overhead, particularly if the service depends on other services. It may be difficult to test all flows, for example the unhappy paths. WireMock provides a fast, full-featured solution for testing services.

- **Why not use WireMock directly?** WireMock is designed for Java. It does not interface directly with TypeScript or Javascript. WireMock Captain provides an easy, familiar way for TS/JS tests to manage the WireMock simulator.  You don't need to install any Java tooling.

- **A strategy that works.**  WireMock Captain is actively used to test many microservices that support a major commercial product.


## How it works

A typical flow goes like this:

- A script launches the `WireMock` docker container, which will already be running when the Node.js project starts
- A test uses `wiremock-captain` to configure WireMock with a mock definition (request-response schema)
- When the API makes an HTTP request, it will call the mocked instance of the API
- The mocked API response is used by the API to complete the operation being tested
- `expect` can be used to check if requests were made to the API with matching schema

<div>
  <br />
    <img width="700" src="https://github.com/HBOCodeLabs/wiremock-captain/blob/main/docs/images/wmc-block-diagram.svg?raw=true">
  <p />
</div>


**Note**: Jest and TypeScript are not required; other equivalent tools can be easily substituted.

The library can be used to mock multiple APIs with complex request-response schemas. For more examples, see the
**Examples** section below.

If you are using the [Jest](https://jestjs.io/) framework, you can also use the `expect`
wrapper to do equality and other checks.


## Running the demo

Here's how to set up WireMock Captain.  The demo project can be copy+pasted as a starting point for your own project.

1. Install the Docker platform, if you have not already done so.  Instructions are here: https://docs.docker.com/get-docker

2. Clone the WireMock Captain repo:

   ```shell
   $ git clone https://github.com/HBOCodeLabs/wiremock-captain.git
   ```

3. Build the WireMock project:

   ```shell
   $ cd wiremock-captain
   $ npm install
   $ npm run build
   ```

4. Now build the `express-app` demo project (which depends on step 3):
   ```shell
   $ cd wiremock-captain/examples/express-app
   $ npm install
   $ npm run build
   ```

5. Launch the `express-app` tests:
   ```shell
   $ cd wiremock-captain/examples/express-app

   # Start the WireMock simulator
   $ docker run -itd --rm -p 8080:8080 --name mocked-service wiremock/wiremock:2.32.0

   # Start the service in development mode
   $ npm run dev

   # Open another terminal instance and run the test
   $ npm run test
   ```

If the tests passed, that means the docker instance used to mock the API at `http://localhost:8080/post` was called
during testing. If the mocks were not set up correctly or the docker instance was not running, the test would have
failed.


## Authoring your own tests
Assuming the wiremock docker instance is already running using the following command:

```bash
docker run -itd --rm --name wiremock-container -p 8080:8080 wiremock/wiremock:2.32.0 --record-mappings --verbose
```

Typical usage looks like this:

```typescript
import { WireMock } from 'wiremock-captain';

describe('Integration with WireMock', () => {
  // Connect to WireMock
  const wiremockEndpoint = 'http://localhost:8080';
  const mock = new WireMock(wiremockEndpoint);

  test('mocks downstream service', async () => {
    const request: IWireMockRequest = {
      method: 'POST',
      endpoint: '/test-endpoint',
      body: {
        hello: 'world',
      },
    };
    const mockedResponse: IWireMockResponse = {
      status: 200,
      body: { goodbye: 'world' },
    };
    await mock.register(request, mockedResponse);

    // rest of the test
  });
});
```

## Examples

For more examples, look [here](https://github.com/HBOCodeLabs/wiremock-captain/tree/main/docs/examples)

## Debugging
- open terminal and run `docker attach mocked-service`
- run the tests in separate terminal
- watch the logs in the wiremock container to find out possible issues/bugs

## Best practices

Here is a list of recommended ways to use the library:

- When running integration tests, run the service inside a docker container. That not only provides isolation for
the current service, but will also allow for wiremock containers to be set up on the same bridge network as the service.
This will allow for easier mocking of multiple downstream services with each service having its own wiremock instance.
Make use of `--network-alias` docker flag to make better testing endpoints over the bridge.
- Try not to mock calls for each test. If possible, have a default behaviour for the mocked services and override them
inside each test if necessary using `stubPriority` from `IWireMockFeatures`.
- To avoid mocked stubs overriding each other, run the tests synchronously (e.g. using flag
  `--runInBand` with `jest`)
- Use `getUnmatchedRequests` to make sure there are no unmatched mocks at the end of each of the tests
- Use `clearAllExceptDefault` after each test to clear mocks set up during individual tests

## WireMock

This project is not officially affiliated with WireMock. For documentation about WireMock,
please visit [http://wiremock.org/docs/](http://wiremock.org/docs/).
