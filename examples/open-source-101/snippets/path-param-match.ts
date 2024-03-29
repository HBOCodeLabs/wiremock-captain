import {
    EndpointFeature,
    IWireMockFeatures,
    IWireMockRequest,
    IWireMockResponse,
    WireMock,
} from 'wiremock-captain';

const mock = new WireMock('http://localhost:8085');

const request: IWireMockRequest = {
    method: 'POST',
    // create endpoint to match `/students/{student id}` regex
    endpoint: '/students/[A-Za-z0-9-]*',
};
const mockedResponse: IWireMockResponse = {
    status: 200,
};
const features: IWireMockFeatures = {
    requestEndpointFeature: EndpointFeature.UrlPathPattern,
};

await mock.register(request, mockedResponse, features);

// curl --location --request POST 'http://localhost:8085/students/some-student-id'
