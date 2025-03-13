// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

describe('WireMockAPI', () => {
    const mockData = {};
    let mockFn: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.resetModules();
        mockFn = jest.fn().mockResolvedValue({ json: jest.fn().mockResolvedValue(mockData) });
        global.fetch = mockFn;
    });

    afterEach(() => {
        jest.unmock('../../src/RequestModel');
        jest.unmock('../../src/ResponseModel');
        jest.unmock('../../src/utils');
    });

    describe('register', () => {
        test('should return empty response w/ priority and scenario', async () => {
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
            expect(mockFn).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings', {
                body: '{}',
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
            });
            expect(resp).toEqual({});
        });
    });

    describe('registerDefaultResponse', () => {
        test('should return empty response w/ priority and scenario', async () => {
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
            expect(mockFn).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings', {
                body: '{}',
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
            });
            expect(resp).toEqual({});
        });
    });

    describe('verify', () => {
        test('verify calls', async () => {
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

            const mockRequests = {
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
            mockFn.mockReset();
            mockFn = jest
                .fn()
                .mockResolvedValue({ json: jest.fn().mockResolvedValue(mockRequests) });
            global.fetch = mockFn;

            const calls = await mock.getRequestsForAPI();
            expect(mockFn).toHaveBeenCalledWith(wireMockUrl + '__admin/requests', {
                method: 'GET',
            });
            expect(calls.length).toEqual(1);
        });
    });
});
