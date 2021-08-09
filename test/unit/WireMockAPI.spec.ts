// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

describe('WireMockAPI', () => {
    const mockJson = { body: {} };
    const mockNodeFetch = {
        default: jest.fn().mockReturnValue({
            json: jest.fn().mockImplementation(() => Promise.resolve(mockJson.body)),
        }),
    };

    beforeEach(() => {
        mockJson.body = {};
        jest.mock('node-fetch', () => mockNodeFetch);
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
            expect(mockNodeFetch.default).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings', {
                method: 'POST',
                body: JSON.stringify({}),
            });
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
            expect(mockNodeFetch.default).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings', {
                method: 'POST',
                body: JSON.stringify({}),
            });
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

            mockJson.body = {
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
            expect(mockNodeFetch.default).toHaveBeenCalledWith(wireMockUrl + '__admin/requests', {
                method: 'GET',
            });
            expect(calls.length).toEqual(1);
        });
    });
});
