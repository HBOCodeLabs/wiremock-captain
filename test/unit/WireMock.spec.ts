// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { DelayType, WireMockFault } from '../../src';

describe('WireMock', () => {
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
        jest.unmock('../../src/utils');
        jest.resetModules();
        jest.clearAllMocks();
    });

    describe('clear', () => {
        it('clears all', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.clearAll();
            expect(mockAxios.default.delete).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings');
            expect(mockAxios.default.delete).toHaveBeenCalledWith(wireMockUrl + '__admin/requests');
        });

        it('clears all except default', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.clearAllExceptDefault();
            expect(mockAxios.default.post).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings/reset',
            );
            expect(mockAxios.default.delete).toHaveBeenCalledWith(wireMockUrl + '__admin/requests');
        });
    });

    describe('deleteMapping', () => {
        it('should delete the stub', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.deleteMapping('test-id');
            expect(mockAxios.default.delete).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings/test-id',
            );
        });
    });

    describe('getMapping', () => {
        it('should get all mappings', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getAllMappings();
            expect(mockAxios.default.get).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings');
        });

        it('should get a single mapping', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getMapping('test-mapping-id');
            expect(mockAxios.default.get).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings/test-mapping-id',
            );
        });
    });

    describe('getRequest', () => {
        it('getAllRequests', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getAllRequests();
            expect(mockAxios.default.get).toHaveBeenCalledWith(wireMockUrl + '__admin/requests');
        });

        it('getUnmatchedRequests', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getUnmatchedRequests();
            expect(mockAxios.default.get).toHaveBeenCalledWith(
                wireMockUrl + '__admin/requests/unmatched',
            );
        });
    });

    describe('getScenario', () => {
        it('getAllScenarios', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getAllScenarios();
            expect(mockAxios.default.get).toHaveBeenCalledWith(wireMockUrl + '__admin/scenarios');
        });
    });

    describe('register', () => {
        it('should return empty response w/ priority and scenario', async () => {
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
            expect(mockAxios.default.post).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings',
                expect.objectContaining({ priority: 1 }),
                {
                    headers: { 'Content-Type': 'application/json' },
                },
            );
            expect(mockAxios.default.post).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings',
                expect.objectContaining({ scenarioName: 'test-scenario' }),
                {
                    headers: { 'Content-Type': 'application/json' },
                },
            );
            expect(resp).toEqual({});
        });

        it('should return empty response w/o priority and scenario', async () => {
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
            expect(resp).toEqual({});
        });

        it('should return empty response w/ webhook', async () => {
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
            expect(mockAxios.default.post).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings',
                expect.objectContaining({
                    postServeActions: [
                        {
                            name: 'webhook',
                            parameters: {
                                method: 'POST',
                                url: 'http://test-url',
                                headers: { testHeaderKey: 'testHeaderValue' },
                                body: JSON.stringify({ a: 1 }),
                                delay: { b: 2 },
                            },
                        },
                    ],
                }),
                {
                    headers: { 'Content-Type': 'application/json' },
                },
            );
            expect(resp).toEqual({});
        });

        it('should return empty response w/ fault', async () => {
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
            expect(mockAxios.default.post).toHaveBeenCalledWith(
                'https://testservice/__admin/mappings',
                {
                    request: undefined,
                    response: { fault: 'EMPTY_RESPONSE' },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
        });
    });

    describe('resetScenario', () => {
        it('resetAllScenarios', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.resetAllScenarios();
            expect(mockAxios.default.post).toHaveBeenCalledWith(
                wireMockUrl + '__admin/scenarios/reset',
            );
        });
    });

    describe('resetMapping', () => {
        it('should reset mappings', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.resetMappings();
            expect(mockAxios.default.post).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings/reset',
            );
        });
    });

    describe('verify', () => {
        it('verify calls', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);

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
            const calls = await mock.getRequestsForAPI('POST', '/test-endpoint');
            expect(mockAxios.default.get).toHaveBeenCalledWith(wireMockUrl + '__admin/requests');
            expect(calls.length).toEqual(1);

            const getCalls = await mock.getRequestsForAPI('GET', '/test-endpoint');
            expect(mockAxios.default.get).toHaveBeenCalledWith(wireMockUrl + '__admin/requests');
            expect(getCalls.length).toEqual(1);
        });
    });
});
