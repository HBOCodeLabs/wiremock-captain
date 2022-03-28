import {
    IWireMockFeatures,
    IWireMockRequest,
    IWireMockResponse,
    MatchingAttributes,
    WireMock,
} from 'wiremock-captain';

const externalServiceEndpoint = 'http://localhost:8080';
const mock = new WireMock(externalServiceEndpoint);

const defaultRequest: IWireMockRequest = {
    method: 'GET',
    endpoint: '/api-endpoint',
};
const errorResponse: IWireMockResponse = {
    status: 401,
    body: { error: 'Unauthorized' },
};
const lowerPriorityFeature: IWireMockFeatures = { stubPriority: 2 };
// set up lower priority mock
// respond back with 401 for all requests
await mock.register(defaultRequest, errorResponse, lowerPriorityFeature);

const defaultRequestWithHeader: IWireMockRequest = {
    method: 'GET',
    endpoint: '/api-endpoint',
    headers: {
        Authorization: 'Bearer .*',
    },
};
const successResponse: IWireMockResponse = {
    status: 200,
    body: { message: 'Authorized' },
};
const higherPriorityFeature: IWireMockFeatures = {
    stubPriority: 1,
    requestHeaderFeatures: {
        Authorization: MatchingAttributes.Matches,
    },
};
// set up higher priority mock
// respond back with 200 if Authorization header starting with 'Bearer ' is present
await mock.register(defaultRequestWithHeader, successResponse, higherPriorityFeature);
