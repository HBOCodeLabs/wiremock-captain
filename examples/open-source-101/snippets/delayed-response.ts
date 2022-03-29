import {
    DelayType,
    IWireMockFeatures,
    IWireMockRequest,
    IWireMockResponse,
    WireMock,
} from 'wiremock-captain';

const mock = new WireMock('http://localhost:8085');

const request: IWireMockRequest = {
    method: 'POST',
    endpoint: '/api-endpoint',
};
const mockedResponse: IWireMockResponse = {
    status: 200,
};
const features: IWireMockFeatures = {
    responseDelay: {
        // create a uniform delay for the response between 3 and 5 seconds
        // can instead create a FIXED delay with constant delay time
        type: DelayType.UNIFORM,
        lower: 3000,
        upper: 5000,
    },
};

await mock.register(request, mockedResponse, features);

// curl --location --request POST 'http://localhost:8085/api-endpoint'
