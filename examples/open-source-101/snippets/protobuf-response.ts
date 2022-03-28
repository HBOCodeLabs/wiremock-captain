import {
    BodyType,
    IWireMockFeatures,
    IWireMockRequest,
    IWireMockResponse,
    WireMock,
} from 'wiremock-captain';

const mock = new WireMock('http://localhost:8080');

const request: IWireMockRequest = {
    method: 'POST',
    endpoint: '/api-endpoint',
};

// create binary response data
const responseBase64 = Buffer.from('test-string').toString('base64');
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

await mock.register(request, mockedResponse, features);
