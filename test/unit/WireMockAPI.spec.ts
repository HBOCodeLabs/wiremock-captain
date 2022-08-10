// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

describe('WireMockAPI', () => {
    const mockData = {
        data: {},
    };
    const deleteMock = jest.fn().mockResolvedValue(mockData as never);
    const getMock = jest.fn().mockResolvedValue(mockData as never);
    const postMock = jest.fn().mockResolvedValue(mockData as never);

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        jest.mock('axios', () => ({
            default: {
                delete: deleteMock,
                get: getMock,
                post: postMock,
            },
            AxiosRequestHeaders: jest.fn(),
            AxiosResponse: jest.fn(),
        }));
    });

    afterEach(() => {
        jest.unmock('../../src/RequestModel');
        jest.unmock('../../src/ResponseModel');
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
            expect(postMock).toHaveBeenCalledWith(
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
            expect(postMock).toHaveBeenCalledWith(
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
            expect(getMock).toHaveBeenCalledWith(wireMockUrl + '__admin/requests');
            expect(calls.length).toEqual(1);
        });
    });
});
