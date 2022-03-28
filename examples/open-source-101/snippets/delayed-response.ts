import {
    DelayType,
    IWireMockFeatures,
    IWireMockRequest,
    IWireMockResponse,
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
    responseDelay: {
        type: DelayType.UNIFORM,
        lower: 3000,
        upper: 5000,
    },
};

await mock.register(request, mockedResponse, features);
