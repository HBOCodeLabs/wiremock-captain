// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { DelayType, WireMockFault } from '../../src';

describe('WireMock', () => {
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

    describe('clear', () => {
        test('clears all', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.clearAll();
            expect(mockFn).toHaveBeenCalledWith('https://testservice/__admin/mappings', {
                method: 'DELETE',
            });
            expect(mockFn).toHaveBeenCalledWith('https://testservice/__admin/requests', {
                method: 'DELETE',
            });
        });

        test('clears all except default', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.clearAllExceptDefault();
            expect(mockFn).toHaveBeenCalledWith('https://testservice/__admin/mappings/reset', {
                method: 'POST',
            });
            expect(mockFn).toHaveBeenCalledWith('https://testservice/__admin/requests', {
                method: 'DELETE',
            });
        });
    });

    describe('deleteMapping', () => {
        test('should delete the stub', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.deleteMapping('test-id');
            expect(mockFn).toHaveBeenCalledWith('https://testservice/__admin/mappings/test-id', {
                method: 'DELETE',
            });
        });
    });

    describe('getMapping', () => {
        test('should get all mappings', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getAllMappings();
            expect(mockFn).toHaveBeenCalledWith('https://testservice/__admin/mappings', {
                method: 'GET',
            });
        });

        test('should get a single mapping', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getMapping('test-mapping-id');
            expect(mockFn).toHaveBeenCalledWith(
                'https://testservice/__admin/mappings/test-mapping-id',
                {
                    method: 'GET',
                },
            );
        });
    });

    describe('getRequest', () => {
        test('getAllRequests', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getAllRequests();
            expect(mockFn).toHaveBeenCalledWith(wireMockUrl + '__admin/requests', {
                method: 'GET',
            });
        });

        test('getUnmatchedRequests', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getUnmatchedRequests();
            expect(mockFn).toHaveBeenCalledWith(wireMockUrl + '__admin/requests/unmatched', {
                method: 'GET',
            });
        });
    });

    describe('getScenario', () => {
        test('getAllScenarios', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getAllScenarios();
            expect(mockFn).toHaveBeenCalledWith(wireMockUrl + '__admin/scenarios', {
                method: 'GET',
            });
        });
    });

    describe('register', () => {
        test('should return empty response w/ priority and scenario', async () => {
            jest.mock('../../src/RequestModel', () => ({
                createWireMockRequest: jest.fn().mockName('mockedGetRequest'),
            }));
            jest.mock('../../src/ResponseModel', () => ({
                createWireMockResponse: jest.fn().mockName('mockedGetResponse'),
            }));
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            const resp = await mock.register(
                {},
                {},
                {
                    stubPriority: 1,
                    scenario: { scenarioName: 'test-scenario', requiredScenarioState: 'Started' },
                },
            );
            expect(mockFn).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings',
                expect.objectContaining({
                    // eslint-disable-next-line no-useless-escape
                    body: expect.stringContaining('\"priority\":1'),
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                }),
            );
            expect(mockFn).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings',
                expect.objectContaining({
                    // eslint-disable-next-line no-useless-escape
                    body: expect.stringContaining('\"scenarioName\":\"test-scenario\"'),
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                }),
            );
            expect(mockFn).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings',
                expect.objectContaining({
                    // eslint-disable-next-line no-useless-escape
                    body: expect.stringContaining('\"requiredScenarioState\":\"Started\"'),
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                }),
            );
            expect(resp).toEqual({});
        });

        test('should return empty response w/o priority and scenario', async () => {
            jest.mock('../../src/RequestModel', () => ({
                createWireMockRequest: jest.fn().mockName('mockedGetRequest'),
            }));
            jest.mock('../../src/ResponseModel', () => ({
                createWireMockResponse: jest.fn().mockName('mockedGetResponse'),
            }));
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            const resp = await mock.register({}, {});
            expect(mockFn).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings',
                expect.objectContaining({
                    body: '{}',
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                }),
            );
            expect(resp).toEqual({});
        });

        test('should return empty response w/ webhook', async () => {
            jest.mock('../../src/RequestModel', () => ({
                createWireMockRequest: jest.fn().mockName('mockedGetRequest'),
            }));
            jest.mock('../../src/ResponseModel', () => ({
                createWireMockResponse: jest.fn().mockName('mockedGetResponse'),
            }));
            jest.mock('../../src/utils', () => ({
                getWebhookBody: jest.fn().mockReturnValue(JSON.stringify({ a: 1 })),
                getWebhookDelayBody: jest.fn().mockReturnValue({ b: 2 }),
            }));
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            const resp = await mock.register(
                {},
                {},
                {
                    webhook: {
                        method: 'POST',
                        url: 'http://test-url',
                        headers: { testHeaderKey: 'testHeaderValue' },
                        body: { type: 'JSON', data: {} },
                        delay: { type: DelayType.FIXED, constantDelay: 100 },
                    },
                },
            );
            expect(mockFn).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings', {
                body: '{"postServeActions":[{"name":"webhook","parameters":{"method":"POST","url":"http://test-url","headers":{"testHeaderKey":"testHeaderValue"},"body":"{\\"a\\":1}","delay":{"b":2}}}]}',
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
            });
            expect(resp).toEqual({});
        });

        test('should return empty response w/ fault', async () => {
            jest.mock('../../src/RequestModel', () => ({
                createWireMockRequest: jest.fn().mockName('mockedGetRequest'),
            }));
            jest.mock('../../src/ResponseModel', () => ({
                createWireMockResponse: jest.fn().mockName('mockedGetResponse'),
            }));
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            const resp = await mock.register({}, {}, { fault: WireMockFault.EMPTY_RESPONSE });
            expect(resp).toEqual({});
            expect(mockFn).toHaveBeenCalledWith('https://testservice/__admin/mappings', {
                body: '{"response":{"fault":"EMPTY_RESPONSE"}}',
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            });
        });
    });

    describe('resetScenario', () => {
        test('resetAllScenarios', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.resetAllScenarios();
            expect(mockFn).toHaveBeenCalledWith(wireMockUrl + '__admin/scenarios/reset', {
                method: 'POST',
            });
        });
    });

    describe('resetMapping', () => {
        test('should reset mappings', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.resetMappings();
            expect(mockFn).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings/reset', {
                method: 'POST',
            });
        });
    });

    describe('verify', () => {
        test('verify calls', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);

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
                    {
                        request: {
                            method: 'GET',
                            url: '/test-endpoint',
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
            const calls = await mock.getRequestsForAPI('POST', '/test-endpoint');
            expect(mockFn).toHaveBeenCalledWith(wireMockUrl + '__admin/requests', {
                method: 'GET',
            });
            expect(calls.length).toEqual(1);

            const getCalls = await mock.getRequestsForAPI('GET', '/test-endpoint');
            expect(mockFn).toHaveBeenCalledWith(wireMockUrl + '__admin/requests', {
                method: 'GET',
            });
            expect(getCalls.length).toEqual(1);
        });
    });
});
