// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { describe, expect, it } from '@jest/globals';
import axios from 'axios';

import { DelayType, WireMock } from '../../src';

describe('Integration with WireMock', () => {
    const wiremockUrl = 'http://localhost:8080';
    const mock = new WireMock(wiremockUrl);

    beforeEach(async () => {
        await mock.clearAllExceptDefault();
    });

    describe('WireMock', () => {
        describe('register', () => {
            it('sets up a stub mapping in wiremock server and expects mapping to be called', async () => {
                const requestBody = {
                    objectKey: {
                        intKey: 5,
                        stringKey: 'stringKey',
                    },
                };
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await mock.register(
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
                const calls = await mock.getRequestsForAPI('POST', testEndpoint);

                const jestMock = jest.fn();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                calls.forEach((request: any) => {
                    jestMock(request.request);
                });
                expect(jestMock).toHaveBeenCalledWith(
                    expect.objectContaining({ body: JSON.stringify(requestBody) }),
                );
            });

            it('sets up a stub mapping in wiremock server and expects mapping to be called w/ delay', async () => {
                const requestBody = {
                    objectKey: {
                        intKey: 5,
                        stringKey: 'stringKey',
                    },
                };
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await mock.register(
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

            it('sets up a stub mapping in wiremock server without body', async () => {
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await mock.register(
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

            test('sets up a stub mapping in wiremock server w/ webhook', async () => {
                // setup webhook mock
                await mock.register(
                    {
                        method: 'GET',
                        endpoint: '/webhook-test-api',
                    },
                    { status: 200 },
                );

                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                await mock.register(
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
                            url: 'http://localhost:8080/webhook-test-api',
                        },
                    },
                );

                await axios.post(wiremockUrl + testEndpoint);

                await new Promise<void>((resolve) => {
                    const interval = setInterval(async () => {
                        const calls = await mock.getRequestsForAPI('GET', '/webhook-test-api');
                        if (calls.length >= 1) {
                            expect(
                                await mock.getRequestsForAPI('GET', '/webhook-test-api'),
                            ).toHaveLength(1);
                            resolve();
                            clearInterval(interval);
                        }
                    }, 100);
                });
            });

            it('sets up a stub mapping in wiremock server with priority', async () => {
                const requestBody = {
                    objectKey: {
                        intKey: 5,
                        stringKey: 'stringKey',
                    },
                };
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };
                const mockedStub = await mock.register(
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
                const calls = await mock.getRequestsForAPI('POST', testEndpoint);

                const jestMock = jest.fn();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                calls.forEach((request: any) => {
                    jestMock(request.request);
                });
                expect(jestMock).toHaveBeenCalledWith(
                    expect.objectContaining({ body: JSON.stringify(requestBody) }),
                );
            });

            it('sets up a stub mapping in wiremock server with higher priority', async () => {
                const requestBody = {
                    objectKey: {
                        intKey: 5,
                        stringKey: 'stringKey',
                    },
                };
                const testEndpoint = '/test-endpoint';
                const responseBodyLowPriority = { test: 'testValue' };
                const responseBodyHighPriority = { test: 'biggerTestValue' };
                await mock.register(
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
                await mock.register(
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
                const calls = await mock.getRequestsForAPI('POST', testEndpoint);

                const jestMock = jest.fn();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                calls.forEach((request: any) => {
                    jestMock(request.request);
                });
                expect(jestMock).toHaveBeenCalledWith(
                    expect.objectContaining({ body: JSON.stringify(requestBody) }),
                );
            });
        });

        describe('deleteMapping', () => {
            it('sets up a stub mapping and deletes it', async () => {
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };

                expect(await mock.getAllMappings()).toHaveLength(0);
                const { id } = await mock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                );
                expect(await mock.getAllMappings()).toHaveLength(1);
                await mock.deleteMapping(id);
                expect(await mock.getAllMappings()).toHaveLength(0);
            });
        });

        describe('getMapping', () => {
            it('sets up a stub mapping and returns it with get mappings', async () => {
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };

                expect(await mock.getAllMappings()).toHaveLength(0);
                await mock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                );
                expect(await mock.getAllMappings()).toHaveLength(1);
            });
        });

        describe('getRequests', () => {
            it('returns number of requests made', async () => {
                const testEndpoint = '/test-endpoint';
                await mock.register({ method: 'GET', endpoint: testEndpoint }, { status: 200 });

                for (let i = 0; i < 5; i++) {
                    await axios.get(wiremockUrl + testEndpoint);
                }
                expect(await mock.getAllRequests()).toHaveLength(5);
            });

            it('returns number of unmatched requests', async () => {
                const testEndpoint = '/test-endpoint';
                await mock.register({ method: 'GET', endpoint: testEndpoint }, { status: 200 });

                for (let i = 0; i < 5; i++) {
                    try {
                        await axios.post(wiremockUrl + testEndpoint);
                        // eslint-disable-next-line no-empty
                    } catch (error) {}
                }
                expect(await mock.getUnmatchedRequests()).toHaveLength(5);
            });
        });

        describe('getScenarios', () => {
            it('should return scenarios', async () => {
                const testEndpoint = '/test-endpoint';
                expect(await mock.getAllScenarios()).toHaveLength(0);
                await mock.register({ method: 'GET', endpoint: testEndpoint }, { status: 400 });
                expect(await mock.getAllScenarios()).toHaveLength(0);
                await mock.register(
                    { method: 'GET', endpoint: testEndpoint },
                    { status: 200 },
                    {
                        scenario: {
                            scenarioName: 'test-scenario',
                            requiredScenarioState: 'Started',
                        },
                    },
                );
                expect(await mock.getAllScenarios()).toHaveLength(1);
            });
        });

        describe('resetMappings', () => {
            it('sets up a stub mapping and deletes it', async () => {
                const testEndpoint = '/test-endpoint';
                const responseBody = { test: 'testValue' };

                expect(await mock.getAllMappings()).toHaveLength(0);
                await mock.register(
                    {
                        method: 'POST',
                        endpoint: testEndpoint,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                );
                expect(await mock.getAllMappings()).toHaveLength(1);
                await mock.resetMappings();
                expect(await mock.getAllMappings()).toHaveLength(0);
            });
        });

        describe('resetScenarios', () => {
            it('should return scenarios', async () => {
                const testEndpoint = '/test-endpoint';
                await mock.register(
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
                await mock.register(
                    { method: 'GET', endpoint: testEndpoint },
                    { status: 201 },
                    {
                        scenario: {
                            scenarioName: 'test-scenario',
                            requiredScenarioState: 'test-state',
                        },
                    },
                );

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                expect((await mock.getAllScenarios())[0].state).toEqual('Started');
                let resp = await axios.get(wiremockUrl + testEndpoint);
                expect(resp.status).toEqual(200);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                expect((await mock.getAllScenarios())[0].state).toEqual('test-state');
                resp = await axios.get(wiremockUrl + testEndpoint);
                expect(resp.status).toEqual(201);
                await mock.resetAllScenarios();
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                expect((await mock.getAllScenarios())[0].state).toEqual('Started');
            });
        });
    });
});
