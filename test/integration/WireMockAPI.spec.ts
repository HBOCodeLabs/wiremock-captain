// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import axios from 'axios';

import { WireMockAPI } from '../../src';

describe('Integration with WireMock', () => {
    const wiremockUrl = 'http://localhost:8080';
    const testEndpoint = '/test-endpoint';
    const testMethod = 'POST';
    const wireMockAPI = new WireMockAPI(wiremockUrl, testEndpoint, testMethod);

    beforeEach(async () => {
        await wireMockAPI.clearAllExceptDefault();
    });

    describe('WireMockAPI', () => {
        describe('register', () => {
            test('sets up a stub mapping in wiremock server and expects mapping to be called', async () => {
                const requestBody = {
                    objectKey: {
                        intKey: 5,
                        stringKey: 'stringKey',
                    },
                };
                const responseBody = { test: 'testValue' };
                await wireMockAPI.register(
                    {
                        body: requestBody,
                    },
                    {
                        status: 200,
                        body: responseBody,
                    },
                );

                const response = await axios.post(wiremockUrl + testEndpoint, requestBody);
                const body = response.data;
                expect(body).toEqual(responseBody);
                const calls = await wireMockAPI.getRequestsForAPI();

                const jestMock = jest.fn();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                calls.forEach((request: any) => {
                    jestMock(request.request);
                });
                expect(jestMock).toHaveBeenCalledWith(
                    expect.objectContaining({ body: JSON.stringify(requestBody) }),
                );
            });

            test('sets up a stub mapping in wiremock server without body', async () => {
                const responseBody = { test: 'testValue' };
                await wireMockAPI.register(
                    {},
                    {
                        status: 200,
                        body: responseBody,
                    },
                );

                const response = await axios.post(wiremockUrl + testEndpoint);
                const body = response.data;
                expect(body).toEqual(responseBody);
                await wireMockAPI.getRequestsForAPI();
            });

            test('sets up a stub mapping in wiremock server with priority', async () => {
                const requestBody = {
                    objectKey: {
                        intKey: 5,
                        stringKey: 'stringKey',
                    },
                };
                const responseBody = { test: 'testValue' };
                const mockedStub = await wireMockAPI.register(
                    {
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
                const calls = await wireMockAPI.getRequestsForAPI();

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
                const responseBodyLowPriority = { test: 'testValue' };
                const responseBodyHighPriority = { test: 'biggerTestValue' };
                await wireMockAPI.register(
                    {
                        body: requestBody,
                    },
                    {
                        status: 200,
                        body: responseBodyHighPriority,
                    },
                    { stubPriority: 1 },
                );
                await wireMockAPI.register(
                    {
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
                const calls = await wireMockAPI.getRequestsForAPI();

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
            test('sets up a stub mapping and deletes it', async () => {
                const responseBody = { test: 'testValue' };

                expect(await wireMockAPI.getAllMappings()).toHaveLength(0);
                const { id } = await wireMockAPI.register(
                    {},
                    {
                        status: 200,
                        body: responseBody,
                    },
                );
                expect(await wireMockAPI.getAllMappings()).toHaveLength(1);
                await wireMockAPI.deleteMapping(id);
                expect(await wireMockAPI.getAllMappings()).toHaveLength(0);
            });
        });

        describe('getMapping', () => {
            test('sets up a stub mapping and returns it with get mappings', async () => {
                const responseBody = { test: 'testValue' };

                expect(await wireMockAPI.getAllMappings()).toHaveLength(0);
                await wireMockAPI.register(
                    {},
                    {
                        status: 200,
                        body: responseBody,
                    },
                );
                expect(await wireMockAPI.getAllMappings()).toHaveLength(1);
            });
        });

        describe('getRequests', () => {
            test('returns number of unmatched requests', async () => {
                await wireMockAPI.register({}, { status: 200 });

                for (let i = 0; i < 5; i++) {
                    try {
                        await axios.get(wiremockUrl + testEndpoint);
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (error) {
                        /* empty */
                    }
                }
                expect(await wireMockAPI.getUnmatchedRequests()).toHaveLength(5);
            });
        });

        describe('getScenarios', () => {
            test('should return scenarios', async () => {
                expect(await wireMockAPI.getAllScenarios()).toHaveLength(0);
                await wireMockAPI.register({}, { status: 400 });
                expect(await wireMockAPI.getAllScenarios()).toHaveLength(0);
                await wireMockAPI.register(
                    {},
                    { status: 200 },
                    {
                        scenario: {
                            scenarioName: 'test-scenario',
                            requiredScenarioState: 'Started',
                        },
                    },
                );
                expect(await wireMockAPI.getAllScenarios()).toHaveLength(1);
            });
        });

        describe('resetScenarios', () => {
            test('should return scenarios', async () => {
                await wireMockAPI.register(
                    {},
                    { status: 200 },
                    {
                        scenario: {
                            scenarioName: 'test-scenario',
                            requiredScenarioState: 'Started',
                            newScenarioState: 'test-state',
                        },
                    },
                );
                await wireMockAPI.register(
                    {},
                    { status: 201 },
                    {
                        scenario: {
                            scenarioName: 'test-scenario',
                            requiredScenarioState: 'test-state',
                        },
                    },
                );

                // @ts-expect-error known skip
                expect((await wireMockAPI.getAllScenarios())[0].state).toEqual('Started');
                let resp = await axios.post(wiremockUrl + testEndpoint);
                expect(resp.status).toEqual(200);
                // @ts-expect-error known skip
                expect((await wireMockAPI.getAllScenarios())[0].state).toEqual('test-state');
                resp = await axios.post(wiremockUrl + testEndpoint);
                expect(resp.status).toEqual(201);
                await wireMockAPI.resetAllScenarios();
                // @ts-expect-error known skip
                expect((await wireMockAPI.getAllScenarios())[0].state).toEqual('Started');
            });
        });
    });
});
