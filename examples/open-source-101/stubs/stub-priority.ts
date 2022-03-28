import { IWireMockFeatures, IWireMockRequest, IWireMockResponse, WireMock } from 'wiremock-captain';

const externalServiceEndpoint = 'http://localhost:8080';
const mock = new WireMock(externalServiceEndpoint);

const request: IWireMockRequest = {
    method: 'POST',
    endpoint: '/test-endpoint',
    body: {
        hello: 'world',
    },
};
const errorResponse: IWireMockResponse = {
    status: 500,
    body: { error: 'Internal server error' },
};
const lowerPriorityFeature: IWireMockFeatures = { stubPriority: 2 };
await mock.register(request, errorResponse, lowerPriorityFeature);

const successResponse: IWireMockResponse = {
    status: 200,
    body: { goodbye: 'world' },
};
const higherPriorityFeature: IWireMockFeatures = {
    stubPriority: 1,
};
await mock.register(request, successResponse, higherPriorityFeature);
