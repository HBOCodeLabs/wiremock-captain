import {
    IWireMockFeatures,
    IWireMockRequest,
    IWireMockResponse,
    MatchingAttributes,
    WireMock,
} from 'wiremock-captain';

const externalServiceEndpoint = 'http://localhost:8080';
const mock = new WireMock(externalServiceEndpoint);

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
const features: IWireMockFeatures = {
    requestHeaderFeatures: {
        Accept: MatchingAttributes.EqualTo,
    },
};

await mock.register(request, mockedResponse, features);
