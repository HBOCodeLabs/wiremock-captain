import {
    EndpointFeature,
    IWireMockFeatures,
    IWireMockRequest,
    IWireMockResponse,
    MatchingAttributes,
    WireMock,
} from 'wiremock-captain';

const mock = new WireMock('http://localhost:8080');

const request: IWireMockRequest = {
    method: 'GET',
    endpoint: '/api-endpoint',
    queryParameters: {
        country: 'France',
    },
};
const mockedResponse: IWireMockResponse = {
    status: 200,
};
const features: IWireMockFeatures = {
    // only match the path and the the stringified query parameters
    requestEndpointFeature: EndpointFeature.UrlPath,
    requestQueryParamFeatures: {
        // make sure country is equal to France for the mock to be matched
        country: MatchingAttributes.EqualTo,
    },
};

await mock.register(request, mockedResponse, features);
