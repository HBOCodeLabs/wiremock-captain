// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('WireMock', () => {
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

    describe('clear', () => {
        it('clears all', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.clearAll();
            expect(mockNodeFetch.default).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings', {
                method: 'DELETE',
            });
            expect(mockNodeFetch.default).toHaveBeenCalledWith(wireMockUrl + '__admin/requests', {
                method: 'DELETE',
            });
        });
    });

    describe('deleteMapping', () => {
        it('should delete the stub', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.deleteMapping('test-id');
            expect(mockNodeFetch.default).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings/test-id',
                { method: 'DELETE' },
            );
        });
    });

    describe('getMapping', () => {
        it('should get all mappings', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getAllMappings();
            expect(mockNodeFetch.default).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings', {
                method: 'GET',
            });
        });

        it('should get a single mapping', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getMapping('test-mapping-id');
            expect(mockNodeFetch.default).toHaveBeenCalledWith(
                wireMockUrl + '__admin/mappings/test-mapping-id',
                { method: 'GET' },
            );
        });
    });

    describe('getRequest', () => {
        it('getAllRequests', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getAllRequests();
            expect(mockNodeFetch.default).toHaveBeenCalledWith(wireMockUrl + '__admin/requests', {
                method: 'GET',
            });
        });

        it('getUnmatchedRequests', async () => {
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            await mock.getUnmatchedRequests();
            expect(mockNodeFetch.default).toHaveBeenCalledWith(
                wireMockUrl + '__admin/requests/unmatched',
                { method: 'GET' },
            );
        });
    });

    describe('register', () => {
        it('should return empty response w/ priority', async () => {
            jest.mock('../../src/RequestModel', () => ({
                createWireMockRequest: jest.fn().mockName('mockedGetRequest'),
            }));
            jest.mock('../../src/ResponseModel', () => ({
                createWireMockResponse: jest.fn().mockName('mockedGetResponse'),
            }));
            const wireMock = require('../../src/WireMock');
            const wireMockUrl = 'https://testservice/';
            const mock = new wireMock.WireMock(wireMockUrl);
            const resp = await mock.register({}, {}, { stubPriority: 1 });
            expect(mockNodeFetch.default).toHaveBeenCalledWith(wireMockUrl + '__admin/mappings', {
                method: 'POST',
                body: expect.stringContaining('priority'),
            });
            expect(resp).toEqual({});
        });

        it('should return empty response w/o priority', async () => {
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

            mockJson.body = {
                requests: [
                    {
                        request: {
                            method: 'POST',
                            url: '/testEndpoint',
                            body: JSON.stringify(requestBody),
                            queryParams: {},
                            headers: {},
                        },
                    },
                    {
                        request: {
                            method: 'GET',
                            url: '/testEndpoint',
                            queryParams: {},
                            headers: {},
                        },
                    },
                ],
            };
            const calls = await mock.getRequestsForAPI('POST', '/testEndpoint');
            expect(mockNodeFetch.default).toHaveBeenCalledWith(wireMockUrl + '__admin/requests', {
                method: 'GET',
            });
            expect(calls.length).toEqual(1);

            const getCalls = await mock.getRequestsForAPI('GET', '/testEndpoint');
            expect(mockNodeFetch.default).toHaveBeenCalledWith(wireMockUrl + '__admin/requests', {
                method: 'GET',
            });
            expect(getCalls.length).toEqual(1);
        });
    });
});
