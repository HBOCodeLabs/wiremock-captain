// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import axios from 'axios';
import * as express from 'express';
import { Server } from 'http';

import {
    DelayType,
    MatchingAttributes,
    ResponseTransformer,
    WireMock,
    WireMockFault,
} from '../../src';

const WEBHOOK_BASE_URL = 'http://host.docker.internal';
const WEBHOOK_PORT = 9876;

describe('Integration with WireMock', () => {
    const wiremockUrl = 'http://localhost:8080';
    const wireMock = new WireMock(wiremockUrl);
    let webhookPromiseResolve: (r: jest.Mock) => void;
    let webhookPromise: Promise<jest.Mock>;
    let server: Server;

    const webhookGetHandler = (req: express.Request, res: express.Response): void => {
        const webhookCallback = jest.fn();
        webhookCallback(req.query);
        webhookPromiseResolve(webhookCallback);
        res.end();
    };

    const webhookPostHandler = (req: express.Request, res: express.Response): void => {
        const webhookCallback = jest.fn();
        webhookCallback(req.body);
        webhookPromiseResolve(webhookCallback);
        res.end();
    };

    beforeAll(() => {
        // Create webhook server. This will be used by wiremock.
        const app = express();
        app.use(express.json());
        app.get('/webhook', webhookGetHandler);
        app.post('/webhook', webhookPostHandler);
        server = app.listen(WEBHOOK_PORT).on('error', (e) => {
            throw new Error('Error starting webhook callback server: ' + e.message);
        });
    });

    beforeEach(async () => {
        await wireMock.clearAllExceptDefault();
    });

    afterAll(() => {
        wireMock
            .clearAll()
            .then(() => {
                server.close().on('error', (e) => {
                    throw new Error('Error closing webhook callback server: ' + e.message);
                });
            })
            .catch((e) => {
                throw new Error('Error exiting test: ' + e.message);
            });
    });

    describe('WireMock', () => {
        describe('register', () => {
            test('sets up a stub mapping in wiremock server and expects mapping to be called', async () => {
                const requestBody = {
                    objectKey: {
                        intKey: 5,
                        stringKey: 'stringKey',
                    },
                };
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                        body: requestBody,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                );

                const start = Date.now();
                const response = await axios.post(wiremockUrl + testEndpoint, requestBody);
                const body = response.data;
                expect(body).toEqual(responseBody);
                expect(Date.now() - start).toBeLessThan(300);
                const calls = await wireMock.getRequestsForAPI('POST', testEndpoint);

                const jestMock = jest.fn();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                calls.forEach((request: any) => {
                    jestMock(request.request);
                });
                expect(jestMock).toHaveBeenCalledWith(
                    expect.objectContaining({ body: JSON.stringify(requestBody) }),
                );
            });

            test('sets up a stub mapping with response templating and expects response to have request path', async () => {
                const testEndpoint = '/test-endpoint';
                await wireMock.register(
                    {
                        method: 'GET',
                        endpoint: '/test-endpoint',
                    },
                    {
                        status: 200,
                        body: '{{request.path.[0]}}',
                    },
                    {
                        responseTransformers: [ResponseTransformer.RESPONSE_TEMPLATE],
                    },
                );

                const response = await axios.get(wiremockUrl + testEndpoint);
                const body = response.data;
                expect(body).toEqual('test-endpoint');
            });

            test('sets up a stub mapping in wiremock server and expects mapping to be called w/ delay', async () => {
                const requestBody = {
                    objectKey: {
                        intKey: 5,
                        stringKey: 'stringKey',
                    },
                };
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                        body: requestBody,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                    {
                        responseDelay: {
                            type: DelayType.FIXED,
                            constantDelay: 300,
                        },
                    },
                );

                const start = Date.now();
                const response = await axios.post(wiremockUrl + testEndpoint, requestBody);
                const body = response.data;
                expect(body).toEqual(responseBody);
                expect(Date.now() - start).toBeGreaterThanOrEqual(300);
            });

            test('sets up a stub mapping in wiremock server without body', async () => {
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                );

                const response = await axios.post(wiremockUrl + testEndpoint);
                const body = response.data;
                expect(body).toEqual(responseBody);
            });

            test('sets up a stub mapping in wiremock server w/ array order ignored', async () => {
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                        body: [{ a: 1 }, { b: 2 }],
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                    { requestIgnoreArrayOrder: true },
                );

                const response = await axios.post(wiremockUrl + testEndpoint, [{ b: 2 }, { a: 1 }]);
                const body = response.data;
                expect(body).toEqual(responseBody);
            });

            test('sets up a stub mapping in wiremock server w/ GET webhook', async () => {
                // This promise is resolved by the express "webhook" server
                webhookPromise = new Promise((resolve: (r: jest.Mock) => void) => {
                    webhookPromiseResolve = resolve;
                });

                const timestamp = Date.now();
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                    {
                        webhook: {
                            method: 'GET',
                            url: `${WEBHOOK_BASE_URL}:9876/webhook?timestamp=${timestamp}`,
                        },
                    },
                );

                await axios.post(wiremockUrl + testEndpoint);

                const webhookCallback = await webhookPromise;

                expect(webhookCallback).toHaveBeenCalledTimes(1);
                expect(webhookCallback).toHaveBeenNthCalledWith(1, {
                    timestamp: timestamp.toString(),
                });
            });

            test('sets up a stub mapping in wiremock server w/ POST webhook', async () => {
                // This promise is resolved by the express "webhook" server
                webhookPromise = new Promise((resolve: (r: jest.Mock) => void) => {
                    webhookPromiseResolve = resolve;
                });

                const timestamp = Date.now();
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                    {
                        webhook: {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            url: `${WEBHOOK_BASE_URL}:9876/webhook`,
                            body: {
                                type: 'JSON',
                                data: { timestamp },
                            },
                        },
                    },
                );

                await axios.post(wiremockUrl + testEndpoint);

                const webhookCallback = await webhookPromise;

                expect(webhookCallback).toHaveBeenCalledTimes(1);
                expect(webhookCallback).toHaveBeenNthCalledWith(1, { timestamp });
            });

            test('sets up a stub mapping in wiremock server with priority', async () => {
                const requestBody = {
                    objectKey: {
                        intKey: 5,
                        stringKey: 'stringKey',
                    },
                };
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                const mockedStub = await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                        body: requestBody,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                    { stubPriority: 1 },
                );
                expect(mockedStub.priority).toEqual(1);
                const response = await axios.post(wiremockUrl + testEndpoint, requestBody);
                const body = response.data;
                expect(body).toEqual(responseBody);
                const calls = await wireMock.getRequestsForAPI('POST', testEndpoint);

                const jestMock = jest.fn();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                calls.forEach((request: any) => {
                    jestMock(request.request);
                });
                expect(jestMock).toHaveBeenCalledWith(
                    expect.objectContaining({ body: JSON.stringify(requestBody) }),
                );
            });

            test('sets up a stub mapping in wiremock server with higher priority', async () => {
                const requestBody = {
                    objectKey: {
                        intKey: 5,
                        stringKey: 'stringKey',
                    },
                };
                const testEndpoint = '/test-endpoint';
                const responseBodyLowPriority = { test: 'testValue' };
                const responseBodyHighPriority = { test: 'biggerTestValue' };
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                        body: requestBody,
                    },
                    {
                        status: 200,
                        body: responseBodyHighPriority,
                    },
                    { stubPriority: 1 },
                );
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                        body: requestBody,
                    },
                    {
                        status: 200,
                        body: responseBodyLowPriority,
                    },
                    { stubPriority: 2 },
                );
                const response = await axios.post(wiremockUrl + testEndpoint, requestBody);
                const body = response.data;
                expect(body).toEqual(responseBodyHighPriority);
                const calls = await wireMock.getRequestsForAPI('POST', testEndpoint);

                const jestMock = jest.fn();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                calls.forEach((request: any) => {
                    jestMock(request.request);
                });
                expect(jestMock).toHaveBeenCalledWith(
                    expect.objectContaining({ body: JSON.stringify(requestBody) }),
                );
            });

            test('sets up a stub mapping in wiremock server w/ EMPTY_RESPONSE fault', async () => {
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                    { fault: WireMockFault.EMPTY_RESPONSE },
                );

                await expect(axios.post(wiremockUrl + testEndpoint)).rejects.toThrow(
                    'socket hang up',
                );
            });

            test('sets up a stub mapping in wiremock server w/ CONNECTION_RESET_BY_PEER fault', async () => {
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                    { fault: WireMockFault.CONNECTION_RESET_BY_PEER },
                );

                await expect(axios.post(wiremockUrl + testEndpoint)).rejects.toThrow(
                    'socket hang up',
                );
            });

            test('sets up a stub mapping in wiremock server w/ RANDOM_DATA_THEN_CLOSE fault', async () => {
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                    { fault: WireMockFault.RANDOM_DATA_THEN_CLOSE },
                );

                await expect(axios.post(wiremockUrl + testEndpoint)).rejects.toThrow(
                    'Parse Error: Expected HTTP/',
                );
            });
        });

        describe('deleteMapping', () => {
            test('sets up a stub mapping and deletes it', async () => {
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };

                expect(await wireMock.getAllMappings()).toHaveLength(0);
                const { id } = await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                );
                expect(await wireMock.getAllMappings()).toHaveLength(1);
                await wireMock.deleteMapping(id);
                expect(await wireMock.getAllMappings()).toHaveLength(0);
            });
        });

        describe('getMapping', () => {
            test('sets up a stub mapping and returns it with get mappings', async () => {
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };

                expect(await wireMock.getAllMappings()).toHaveLength(0);
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                );
                expect(await wireMock.getAllMappings()).toHaveLength(1);
            });
        });

        describe('getRequests', () => {
            test('returns number of requests made', async () => {
                const testEndpoint = '/test-endpoint';
                await wireMock.register({ method: 'GET', endpoint: testEndpoint }, { status: 200 });

                for (let i = 0; i < 5; i++) {
                    await axios.get(wiremockUrl + testEndpoint);
                }
                expect(await wireMock.getAllRequests()).toHaveLength(5);
            });

            test('returns number of unmatched requests', async () => {
                const testEndpoint = '/test-endpoint';
                await wireMock.register({ method: 'GET', endpoint: testEndpoint }, { status: 200 });

                for (let i = 0; i < 5; i++) {
                    try {
                        await axios.post(wiremockUrl + testEndpoint);
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (error) {
                        // empty
                    }
                }
                expect(await wireMock.getUnmatchedRequests()).toHaveLength(5);
            });
        });

        describe('getScenarios', () => {
            test('should return scenarios', async () => {
                const testEndpoint = '/test-endpoint';
                expect(await wireMock.getAllScenarios()).toHaveLength(0);
                await wireMock.register({ method: 'GET', endpoint: testEndpoint }, { status: 400 });
                expect(await wireMock.getAllScenarios()).toHaveLength(0);
                await wireMock.register(
                    { method: 'GET', endpoint: testEndpoint },
                    { status: 200 },
                    {
                        scenario: {
                            scenarioName: 'test-scenario',
                            requiredScenarioState: 'Started',
                        },
                    },
                );
                expect(await wireMock.getAllScenarios()).toHaveLength(1);
            });
        });

        describe('resetMappings', () => {
            test('sets up a stub mapping and deletes it', async () => {
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };

                expect(await wireMock.getAllMappings()).toHaveLength(0);
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                );
                expect(await wireMock.getAllMappings()).toHaveLength(1);
                await wireMock.resetMappings();
                expect(await wireMock.getAllMappings()).toHaveLength(0);
            });
        });

        describe('resetScenarios', () => {
            test('should return scenarios', async () => {
                const testEndpoint = '/test-endpoint';
                await wireMock.register(
                    { method: 'GET', endpoint: testEndpoint },
                    { status: 200 },
                    {
                        scenario: {
                            scenarioName: 'test-scenario',
                            requiredScenarioState: 'Started',
                            newScenarioState: 'test-state',
                        },
                    },
                );
                await wireMock.register(
                    { method: 'GET', endpoint: testEndpoint },
                    { status: 201 },
                    {
                        scenario: {
                            scenarioName: 'test-scenario',
                            requiredScenarioState: 'test-state',
                        },
                    },
                );

                // @ts-expect-error known skip
                expect((await wireMock.getAllScenarios())[0].state).toEqual('Started');
                let resp = await axios.get(wiremockUrl + testEndpoint);
                expect(resp.status).toEqual(200);
                // @ts-expect-error known skip
                expect((await wireMock.getAllScenarios())[0].state).toEqual('test-state');
                resp = await axios.get(wiremockUrl + testEndpoint);
                expect(resp.status).toEqual(201);
                await wireMock.resetAllScenarios();
                // @ts-expect-error known skip
                expect((await wireMock.getAllScenarios())[0].state).toEqual('Started');
            });
        });

        describe('findMappingByMetadata', () => {
            test('should create a mock with metadata and find it by metadata', async () => {
                const testEndpoint = '/test-endpoint';
                const requestBody = { key: 'value' };
                const responseBody = { test: 'testValue' };
                const metadata = { metaKey: 'metaValue' };

                // Register a mock with metadata
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                        body: requestBody,
                        metadata: metadata,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                );

                // Find the mock by metadata
                const foundMappings = await wireMock.findMappingByMetadata(
                    {
                        expression: '$.metaKey',
                        contains: 'metaValue',
                    },
                    MatchingAttributes.MatchesJsonPath,
                );

                // Verify that the found mappings contain the registered mock
                expect(foundMappings).toHaveLength(1);
            });
        });

        describe('removeMappingByMetadata', () => {
            test('should create a mock with metadata and remove it by metadata', async () => {
                const testEndpoint = '/test-endpoint';
                const requestBody = { key: 'value' };
                const responseBody = { test: 'testValue' };
                const metadata = { metaKey: 'metaValue' };

                // Register a mock with metadata
                await wireMock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                        body: requestBody,
                        metadata: metadata,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                );

                // Verify that the mock exists
                const foundMappingsBefore = await wireMock.findMappingByMetadata(
                    {
                        expression: '$.metaKey',
                        contains: 'metaValue',
                    },
                    MatchingAttributes.MatchesJsonPath,
                );
                expect(foundMappingsBefore).toHaveLength(1);

                // Remove the mock by metadata
                await wireMock.removeMappingByMetadata(
                    {
                        expression: '$.metaKey',
                        contains: 'metaValue',
                    },
                    MatchingAttributes.MatchesJsonPath,
                );

                // Verify that the mock has been removed
                const foundMappingsAfter = await wireMock.findMappingByMetadata(
                    {
                        expression: '$.metaKey',
                        contains: 'metaValue',
                    },
                    MatchingAttributes.MatchesJsonPath,
                );

                expect(foundMappingsAfter).toHaveLength(0);
            });
        });
    });
});
