import { IWireMockRequest, IWireMockResponse, WireMock } from 'wiremock-captain';

const mock = new WireMock('http://localhost:8080');

const request: IWireMockRequest = {
    method: 'GET',
    endpoint: '/api-endpoint',
    body: {
        hello: 'world',
    },
};
const mockedResponse: IWireMockResponse = {
    status: 200,
    body: { goodbye: 'world' },
};

// if incoming request matches request parameter, respond with mockedResponse parameter
await mock.register(request, mockedResponse);
