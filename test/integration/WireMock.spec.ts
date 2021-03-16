// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { afterAll, describe, expect, it } from '@jest/globals';
import fetch from 'node-fetch';
import { WireMock } from '../../src';

describe('Integration with WireMock', () => {
    // tslint:disable-next-line: no-http-string
    const wiremockUrl = 'http://localhost:8080';
    const mock = new WireMock(wiremockUrl);

    beforeEach(async () => {
        await mock.clearAll();
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
                const testEndpoint = '/testEndpoint';
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

                const response = await fetch(wiremockUrl + testEndpoint, {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                });
                const body = await response.json();
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

            it('sets up a stub mapping in wiremock server without body', async () => {
                const testEndpoint = '/testEndpoint';
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

                const response = await fetch(wiremockUrl + testEndpoint, {
                    method: 'POST',
                });
                const body = await response.json();
                expect(body).toEqual(responseBody);
                await mock.getRequestsForAPI('POST', testEndpoint);
            });

            it('sets up a stub mapping in wiremock server with priority', async () => {
                const requestBody = {
                    objectKey: {
                        intKey: 5,
                        stringKey: 'stringKey',
                    },
                };
                const testEndpoint = '/testEndpoint';
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
                const response = await fetch(wiremockUrl + testEndpoint, {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                });
                const body = await response.json();
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
                const testEndpoint = '/testEndpoint';
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
                const response = await fetch(wiremockUrl + testEndpoint, {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                });
                const body = await response.json();
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
                const testEndpoint = '/testEndpoint';
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
                const testEndpoint = '/testEndpoint';
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
                const testEndpoint = '/testEndpoint';
                await mock.register({ method: 'GET', endpoint: testEndpoint }, { status: 200 });

                for (let i = 0; i < 5; i++) {
                    await fetch(wiremockUrl + testEndpoint, {
                        method: 'GET',
                    });
                }
                expect(await mock.getAllRequests()).toHaveLength(5);
            });

            it('returns number of unmatched requests', async () => {
                const testEndpoint = '/testEndpoint';
                await mock.register({ method: 'GET', endpoint: testEndpoint }, { status: 200 });

                for (let i = 0; i < 5; i++) {
                    await fetch(wiremockUrl + testEndpoint, {
                        method: 'POST',
                    });
                }
                expect(await mock.getUnmatchedRequests()).toHaveLength(5);
            });
        });

        describe('getScenarios', () => {
            it('should return scenarios', async () => {
                const testEndpoint = '/testEndpoint';
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

        describe('resetScenarios', () => {
            it('should return scenarios', async () => {
                const testEndpoint = '/testEndpoint';
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
                let resp = await fetch(wiremockUrl + testEndpoint, {
                    method: 'GET',
                });
                expect(resp.status).toEqual(200);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                expect((await mock.getAllScenarios())[0].state).toEqual('test-state');
                resp = await fetch(wiremockUrl + testEndpoint, {
                    method: 'GET',
                });
                expect(resp.status).toEqual(201);
                await mock.resetAllScenarios();
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                expect((await mock.getAllScenarios())[0].state).toEqual('Started');
            });
        });
    });
});
