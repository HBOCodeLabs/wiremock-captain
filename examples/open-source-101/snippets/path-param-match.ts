import {
    EndpointFeature,
    IWireMockFeatures,
    IWireMockRequest,
    IWireMockResponse,
    WireMock,
} from 'wiremock-captain';

const externalServiceEndpoint = 'http://localhost:8080';
const mock = new WireMock(externalServiceEndpoint);

const request: IWireMockRequest = {
    method: 'POST',
    endpoint: '/test-endpoint/[A-Za-z0-9-]*',
    body: {
        hello: 'world',
    },
};
const mockedResponse: IWireMockResponse = {
    status: 200,
    body: { goodbye: 'world' },
};
const features: IWireMockFeatures = {
    requestEndpointFeature: EndpointFeature.UrlPathPattern,
};

await mock.register(request, mockedResponse, features);
