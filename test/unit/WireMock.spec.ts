// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { DelayType, WireMockFault } from '../../src';

describe('WireMock', () => {
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
        jest.unmock('../../src/utils');
    });

    describe('clear', () => {
        test('clears all', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.clearAll();
            expect(deleteMock).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings');
            expect(deleteMock).toHaveBeenCalledWith(wireMockUrl + '__admin/requests');
        });

        test('clears all except default', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.clearAllExceptDefault();
            expect(postMock).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings/reset');
            expect(deleteMock).toHaveBeenCalledWith(wireMockUrl + '__admin/requests');
        });
    });

    describe('deleteMapping', () => {
        test('should delete the stub', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.deleteMapping('test-id');
            expect(deleteMock).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings/test-id');
        });
    });

    describe('getMapping', () => {
        test('should get all mappings', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getAllMappings();
            expect(getMock).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings');
        });

        test('should get a single mapping', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getMapping('test-mapping-id');
            expect(getMock).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings/test-mapping-id');
        });
    });

    describe('getRequest', () => {
        test('getAllRequests', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getAllRequests();
            expect(getMock).toHaveBeenCalledWith(wireMockUrl + '__admin/requests');
        });

        test('getUnmatchedRequests', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getUnmatchedRequests();
            expect(getMock).toHaveBeenCalledWith(wireMockUrl + '__admin/requests/unmatched');
        });
    });

    describe('getScenario', () => {
        test('getAllScenarios', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getAllScenarios();
            expect(getMock).toHaveBeenCalledWith(wireMockUrl + '__admin/scenarios');
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
            expect(postMock).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings',
                expect.objectContaining({ priority: 1 }),
                {
                    headers: { 'Content-Type': 'application/json' },
                },
            );
            expect(postMock).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings',
                expect.objectContaining({ scenarioName: 'test-scenario' }),
                {
                    headers: { 'Content-Type': 'application/json' },
                },
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
            expect(postMock).toHaveBeenCalledWith(
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
            expect(postMock).toHaveBeenCalledWith(
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
        test('resetAllScenarios', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.resetAllScenarios();
            expect(postMock).toHaveBeenCalledWith(wireMockUrl + '__admin/scenarios/reset');
        });
    });

    describe('resetMapping', () => {
        test('should reset mappings', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.resetMappings();
            expect(postMock).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings/reset');
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
            expect(getMock).toHaveBeenCalledWith(wireMockUrl + '__admin/requests');
            expect(calls.length).toEqual(1);

            const getCalls = await mock.getRequestsForAPI('GET', '/test-endpoint');
            expect(getMock).toHaveBeenCalledWith(wireMockUrl + '__admin/requests');
            expect(getCalls.length).toEqual(1);
        });
    });
});
