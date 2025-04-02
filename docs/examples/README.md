# Examples

If the purpose is to only mock a single API over and over, `WireMockAPI` would be the better option over `WireMock`.

In that case, the usage would look like:

```typescript
import { WireMockAPI } from 'wiremock-captain';

describe('Integration with WireMock', () => {
    // Connect to WireMock
    const downstreamWireMockUrl = 'http://localhost:8080';
    const downstreamWireMockEndpoint = '/test-endpoint';
    const downstreamWireMockMethod = 'POST';
    const mock = new WireMockAPI(downstreamWireMockUrl, downstreamWireMockEndpoint, downstreamWireMockMethod);

    afterAll(() => {
        return mock.clearAllExceptDefault();
    });

    describe('happy path', () => {
        test('mocks downstream service', async () => {
            const requestBody = {
                objectKey: {
                    intKey: 5,
                    stringKey: 'stringKey',
                },
            };
            const responseBody = { test: 'testValue' };
            await mock.register(
                { body: requestBody },
                { status: 200, body: responseBody },
            );

            // rest of the test
        });
    });
});
```

The above allows for skipping specifying `endpoint` and `method` when creating mocks multiple times.

## Basic use case

```typescript
const mockedRequest: IWireMockRequest = { method: 'GET', endpoint: '/test' };
const mockedResponse: IWireMockResponse = { status: 200 };
await mock.register(mockedRequest, mockedResponse);
```

## Clear all mappings except default

To clear all mappings except the default ones, use the `clearAllExceptDefault` method. This method removes all non-default mappings and logs of incoming requests.

```typescript
await mock.clearAllExceptDefault();
```

## Reset all scenarios

To reset all scenarios to their original state, use the `resetAllScenarios` method. This method restores all scenarios to their initial state.

```typescript
await mock.resetAllScenarios();
```

## Get all scenarios

To get a list of all scenarios, use the `getAllScenarios` method. This method retrieves all scenarios in place for the mocked instance.

```typescript
const scenarios = await mock.getAllScenarios();
console.log(scenarios);
```

## Get unmatched requests

To get a list of unmatched requests, use the `getUnmatchedRequests` method. This method retrieves all requests that did not match any mapping.

```typescript
const unmatchedRequests = await mock.getUnmatchedRequests();
console.log(unmatchedRequests);
```

## Find a mapping by metadata

To find a mapping by metadata, use the `findMappingByMetadata` method. This method allows you to specify the metadata to match and retrieve the corresponding mappings.

```typescript
const metadata = { metaKey: 'metaValue' };

// Register a mock with metadata
await mock.register(
    {
        method: 'POST',
        endpoint: '/test-endpoint',
        body: { key: 'value' },
        metadata: metadata,
    },
    {
        status: 200,
        body: { test: 'testValue' },
    },
);

// Find the mock by metadata
const foundMappings = await mock.findMappingByMetadata(
    {
        expression: '$.metaKey',
        contains: 'metaValue',
    },
    MatchingAttributes.MatchesJsonPath,
);

// Verify that the found mappings contain the registered mock
expect(foundMappings).toHaveLength(1);
```

## Remove a mapping by metadata

To remove a mapping by metadata, use the `removeMappingByMetadata` method. This method allows you to specify the metadata to match and remove the corresponding mapping.

```typescript
const metadata = { metaKey: 'metaValue' };

// Register a mock with metadata
await mock.register(
    {
        method: 'POST',
        endpoint: '/test-endpoint',
        body: { key: 'value' },
        metadata: metadata,
    },
    {
        status: 200,
        body: { test: 'testValue' },
    },
);

// Remove the mock by metadata
await mock.removeMappingByMetadata(
    {
        expression: '$.metaKey',
        contains: 'metaValue',
    },
    MatchingAttributes.MatchesJsonPath,
);
```

## Do a regex match for the path

```typescript
const mockedRequest: IWireMockRequest = { method: 'GET', endpoint: '/test' };
const mockedResponse: IWireMockResponse = { status: 200 };
const features: IWireMockFeatures = { requestEndpointFeature: EndpointFeature.UrlPattern };
await mock.register(mockedRequest, mockedResponse, features);
```

## Do a JSON body match but ignore order of elements

```typescript
const mockedRequest: IWireMockRequest = {
    method: 'POST',
    endpoint: '/test',
    body: [{ a: 1 }, { b: 2 }],
};
const mockedResponse: IWireMockResponse = { status: 200 };
const features: IWireMockFeatures = { requestIgnoreArrayOrder: true };
await mock.register(mockedRequest, mockedResponse, features);
```

## Do a path match when query parameters are present

```typescript
const mockedRequest: IWireMockRequest = { method: 'GET', endpoint: '/test' };
const mockedResponse: IWireMockResponse = { status: 200 };
const features: IWireMockFeatures = { requestEndpointFeature: EndpointFeature.UrlPath };
await mock.register(mockedRequest, mockedResponse, features);
```

The above will match only on the path for any query parameters. To match the path and query parameters use the above and specify `queryParameters` when creating the mock request.

## Do an equality match on one of the header and regex non-match of another

```typescript
const headers = { Accept: 'json', Authorization: 'test-auth' };
const mockedRequest: IWireMockRequest = { method: 'GET', endpoint: '/test', headers };
const mockedResponse: IWireMockResponse = { status: 200 };
const features: IWireMockFeatures = {
    requestHeaderFeature: {
        Accept: MatchingAttributes.EqualTo,
        Authorization: MatchingAttributes.DoesNotMatch,
    },
};
await mock.register(mockedRequest, mockedResponse, features);
```

By default, `cookies`, `headers`, and `queryParameters` use equality checks. So the above is equivalent to:

```typescript
const headers = { Accept: 'json', Authorization: 'test-auth' };
const mockedRequest: IWireMockRequest = { method: 'GET', endpoint: '/test', headers };
const mockedResponse: IWireMockResponse = { status: 200 };
const features: IWireMockFeatures = {
    requestHeaderFeature: { Authorization: MatchingAttributes.DoesNotMatch },
};
await mock.register(mockedRequest, mockedResponse, features);
```

## Return binary data (e.g. API with protobuf support)

```typescript
const mockedRequest: IWireMockRequest = {
    endpoint: 'test',
    method: 'GET',
};

const responseBody: Uint8Array = getBinaryResponseBody();
const responseBase64 = Buffer.from(responseBody).toString('base64');

const mockedResponse: IWireMockResponse = {
    status: 200,
    body: responseBase64,
    headers: {
        'Content-Type': 'application/octet-stream; charset=UTF-8',
    },
};
const features: IWireMockFeatures = {
    responseBodyType: BodyType.Base64Body,
};
await mock.register(
    mockedRequest,
    mockedResponse,
    features,
);
```

## Override a mapping

By default, if a request matches to two different stub mappings, the one created more recently will be the one wiremock uses. To have more control in similar scenarios, make use of `priority` while making a new mapping (lower the value, higher the priority).

The following example will always return `201` status code because that mapping has higher priority

```typescript
const headers = { Accept: 'json', Authorization: 'test-auth' };
const mockedRequest: IWireMockRequest = { method: 'GET', endpoint: '/test', headers };
const mockedResponseLowPriority: IWireMockResponse = { status: 200 };
const mockedResponseHighPriority: IWireMockResponse = { status: 201 };
const featuresLowPriority: IWireMockFeatures = { stubPriority: 2 };
const featuresHighPriority: IWireMockFeatures = { stubPriority: 1 };
await mock.register(mockedRequest, mockedResponseHighPriority, featuresHighPriority);
await mock.register(mockedRequest, mockedResponseLowPriority, featuresLowPriority);
```

## Stateful mocks

`Scenario` can be leveraged to allow stateful mocks. To do so, provide `scenario` in `IWireMockFeatures` while building the mock. The starting state will always be `Started`. Example:

```typescript
await mock.register(
    { method: 'GET', endpoint: '/test' },
    { status: 201 },
    {
        scenario: {
            scenarioName: 'test-scenario',
            requiredScenarioState: 'Started',
            newScenarioState: 'test-state',
        },
    },
);
await mock.register(
    { method: 'GET', endpoint: '/test' },
    { status: 200 },
    {
        scenario: {
            scenarioName: 'test-scenario',
            requiredScenarioState: 'test-state',
        },
    },
);
```

In the above example, the first request made will respond with status code `201` while the second and all subsequent requests will respond with status `200`.

## Delayed response

The following mock will delay all responses matching the stub by 300 milliseconds

```typescript
import { DelayType } from 'WireMock-Captain';

await mock.register(
    {
        method: 'GET',
        endpoint: '/test-endpoint',
    },
    {
        status: 200,
    },
    {
        responseDelay: {
            type: DelayType.FIXED,
            constantDelay: 300,
        },
    },
);
```

## Webhook and callback

The following mock will make an HTTP GET call to `http://some-service/webhook-api` every time the given stub is matched

```typescript
await mock.register(
    {
        method: 'GET',
        endpoint: '/test-endpoint',
    },
    {
        status: 200,
    },
    {
        webhook: {
            method: 'GET',
            url: 'http://some-service/webhook-api',
        },
    },
);
```

Webhook is not supported in default WireMock image instance. To get it to work, an additional webhook `.jar` extension is required to be available to the WireMock docker instance. Visit [here](https://wiremock.org/docs/docker/) or `<root>/scripts/setup.sh` for examples

## Response fault

The following mock will return an empty response (no status code, no body) when matched. This can be used to test for socket timeouts, connection resets, etc.

```typescript
await mock.register(
    {
        method: 'GET',
        endpoint: '/test-endpoint',
    },
    {
        status: 200,
        body: {
            hello: 'world',
        },
    },
    {
        fault: WireMockFault.EMPTY_RESPONSE,
    },
);
```

## Response templating

To create a response based on input from the request, use request templating. More [here](https://wiremock.org/docs/response-templating/)

```typescript
await mock.register(
    {
        method: 'GET',
        endpoint: '/test-endpoint',
    },
    {
        status: 200,
        body: '{{request.path.[0]}}',
    },
    {
        responseTransformers: [ResponseTransformer.RESPONSE_TEMPLATE],
    },
);
```

The above will send `test-endpoint` as response body.

## Usage with jest

Jest `expect` works well with `WireMock-Captain` and can used for various kinds of checks

```typescript
const requestBody = {
    key: 'value'
};
const mockedRequest: IWireMockRequest = {
    method: 'POST',
    endpoint: '/test',
    body: requestBody,
};
const mockedResponse: IWireMockResponse = { status: 200 };
await mock.register(mockedRequest, mockedResponse);

const response = await fetch(wiremockUrl + '/test', {
    method: 'POST',
    body: JSON.stringify(requestBody),
});
const body = await response.json();
const calls = await mock.getRequestsForAPI('POST', testEndpoint);
const jestMock = jest.fn();

calls.forEach((request: unknown) => {
    jestMock(request);
});
expect(jestMock).toHaveBeenCalledWith(
    expect.objectContaining({ body: requestBody }),
);
```
