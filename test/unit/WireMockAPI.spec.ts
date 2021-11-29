// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

describe('WireMockAPI', () => {
    const mockData = {
        data: {},
    };
    const mockAxios = {
        default: {
            delete: jest.fn().mockResolvedValue(mockData as never),
            get: jest.fn().mockResolvedValue(mockData as never),
            post: jest.fn().mockResolvedValue(mockData as never),
        },
        AxiosRequestHeaders: jest.fn(),
        AxiosResponse: jest.fn(),
    };

    beforeEach(() => {
        jest.mock('axios', () => mockAxios);
    });

    afterEach(() => {
        jest.unmock('../../src/RequestModel');
        jest.unmock('../../src/ResponseModel');
        jest.resetModules();
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should return empty response w/ priority and scenario', async () => {
            jest.mock('../../src/RequestModel', () => ({
                createWireMockRequest: jest.fn().mockName('mockedGetRequest'),
            }));
            jest.mock('../../src/ResponseModel', () => ({
                createWireMockResponse: jest.fn().mockName('mockedGetResponse'),
            }));
            const wireMockApi = require('../../src/WireMockAPI');
            const wireMockUrl = 'https://testservice/';
            const wireMockEndpoint = '/test-endpoint';
            const wireMockMethod = 'GET';
            const mock = new wireMockApi.WireMockAPI(wireMockUrl, wireMockEndpoint, wireMockMethod);
            const resp = await mock.register({}, {});
            expect(mockAxios.default.post).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings',
                {},
                { headers: { 'Content-Type': 'application/json' } },
            );
            expect(resp).toEqual({});
        });
    });

    describe('registerDefaultResponse', () => {
        it('should return empty response w/ priority and scenario', async () => {
            jest.mock('../../src/RequestModel', () => ({
                createWireMockRequest: jest.fn().mockName('mockedGetRequest'),
            }));
            jest.mock('../../src/ResponseModel', () => ({
                createWireMockResponse: jest.fn().mockName('mockedGetResponse'),
            }));
            const wireMockApi = require('../../src/WireMockAPI');
            const wireMockUrl = 'https://testservice/';
            const wireMockEndpoint = '/test-endpoint';
            const wireMockMethod = 'GET';
            const mock = new wireMockApi.WireMockAPI(wireMockUrl, wireMockEndpoint, wireMockMethod);
            const resp = await mock.registerDefaultResponse({
                body: {},
            });
            expect(mockAxios.default.post).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings',
                {},
                { headers: { 'Content-Type': 'application/json' } },
            );
            expect(resp).toEqual({});
        });
    });

    describe('verify', () => {
        it('verify calls', async () => {
            const wireMockApi = require('../../src/WireMockAPI');
            const wireMockUrl = 'https://testservice/';
            const wireMockEndpoint = '/test-endpoint';
            const wireMockMethod = 'POST';
            const mock = new wireMockApi.WireMockAPI(wireMockUrl, wireMockEndpoint, wireMockMethod);

            const requestBody = {
                objectKey: {
                    intKey: 5,
                    stringKey: 'stringKey',
                },
            };

            mockData.data = {
                requests: [
                    {
                        request: {
                            method: 'POST',
                            url: '/test-endpoint',
                            body: JSON.stringify(requestBody),
                            queryParams: {},
                            headers: {},
                        },
                    },
                ],
            };
            const calls = await mock.getRequestsForAPI();
            expect(mockAxios.default.get).toHaveBeenCalledWith(wireMockUrl + '__admin/requests');
            expect(calls.length).toEqual(1);
        });
    });
});
