import { IWireMockRequest, IWireMockResponse, WireMock } from 'wiremock-captain';

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

await mock.register(request, mockedResponse);
