// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { afterAll, describe, expect, it } from '@jest/globals';
import fetch from 'node-fetch';
import { WireMock } from '../../src';

describe('Integration with WireMock', () => {
    // tslint:disable-next-line: no-http-string
    const wiremockUrl = 'http://localhost:8080';
    const mock = new WireMock(wiremockUrl);

    afterAll(async () => {
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
                const calls = await mock.requests('POST', testEndpoint);

                const jestMock = jest.fn();
                calls.forEach((request: unknown) => {
                    jestMock(request);
                });
                expect(jestMock).toHaveBeenCalledWith(
                    expect.objectContaining({ body: requestBody }),
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
                await mock.requests('POST', testEndpoint);
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
                const calls = await mock.requests('POST', testEndpoint);

                const jestMock = jest.fn();
                calls.forEach((request: unknown) => {
                    jestMock(request);
                });
                expect(jestMock).toHaveBeenCalledWith(
                    expect.objectContaining({ body: requestBody }),
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
                const calls = await mock.requests('POST', testEndpoint);

                const jestMock = jest.fn();
                calls.forEach((request: unknown) => {
                    jestMock(request);
                });
                expect(jestMock).toHaveBeenCalledWith(
                    expect.objectContaining({ body: requestBody }),
                );
            });
        });

        describe('deleteMapping', () => {
            it('sets up a stub mapping and deletes it', async () => {
                await mock.clearMappings();
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
                await mock.clearMappings();
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
    });
});
