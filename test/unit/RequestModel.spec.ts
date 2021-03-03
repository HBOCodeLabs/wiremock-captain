// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EndpointFeature, MatchingAttributes } from '../../src';

describe('RequestModel', () => {
    const testModule: typeof import('../../src/RequestModel') = require('../../src/RequestModel');

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe('createWireMockRequest', () => {
        it('builds with method and endpoint', () => {
            const mockedRequest = testModule.createWireMockRequest({
                method: 'GET',
                endpoint: '/test-endpoint',
            });
            expect(mockedRequest).toEqual({
                method: 'GET',
                url: '/test-endpoint',
            });
        });

        it('builds with method and urlpath', () => {
            const mockedRequest = testModule.createWireMockRequest(
                {
                    method: 'GET',
                    endpoint: '/test-endpoint',
                },
                { requestEndpointFeature: EndpointFeature.UrlPath },
            );
            expect(mockedRequest).toEqual({
                method: 'GET',
                urlPath: '/test-endpoint',
            });
        });

        it('builds with method, endpoint, and body', () => {
            const mockedRequest = testModule.createWireMockRequest({
                method: 'GET',
                endpoint: '/test-endpoint',
                body: { testKey: 'testValue' },
            });
            expect(mockedRequest).toEqual({
                method: 'GET',
                url: '/test-endpoint',
                bodyPatterns: [{ equalToJson: { testKey: 'testValue' } }],
            });
        });

        it('builds with method, endpoint, and body (with feature)', () => {
            const mockedRequest = testModule.createWireMockRequest(
                {
                    method: 'GET',
                    endpoint: '/test-endpoint',
                    body: { testKey: 'testValue' },
                },
                { requestBodyFeature: MatchingAttributes.EqualTo },
            );
            expect(mockedRequest).toEqual({
                method: 'GET',
                url: '/test-endpoint',
                bodyPatterns: [{ equalTo: { testKey: 'testValue' } }],
            });
        });

        it('builds with method, endpoint, and cookies', () => {
            const mockedRequest = testModule.createWireMockRequest({
                method: 'GET',
                endpoint: '/test-endpoint',
                cookies: { profile: 'test-user' },
            });
            expect(mockedRequest).toEqual({
                method: 'GET',
                url: '/test-endpoint',
                cookies: { profile: { equalTo: 'test-user' } },
            });
        });

        it('builds with method, endpoint, and cookies (with feature)', () => {
            const mockedRequest = testModule.createWireMockRequest(
                {
                    method: 'GET',
                    endpoint: '/test-endpoint',
                    cookies: { profile: 'test-user' },
                },
                {
                    requestCookieFeatures: {
                        profile: MatchingAttributes.Contains,
                    },
                },
            );
            expect(mockedRequest).toEqual({
                method: 'GET',
                url: '/test-endpoint',
                cookies: { profile: { contains: 'test-user' } },
            });
        });

        it('builds with method, endpoint, and headers', () => {
            const mockedRequest = testModule.createWireMockRequest({
                method: 'GET',
                endpoint: '/test-endpoint',
                headers: { Accept: 'json' },
            });
            expect(mockedRequest).toEqual({
                method: 'GET',
                url: '/test-endpoint',
                headers: { Accept: { equalTo: 'json' } },
            });
        });

        it('builds with method, endpoint, and headers (with feature)', () => {
            const mockedRequest = testModule.createWireMockRequest(
                {
                    method: 'GET',
                    endpoint: '/test-endpoint',
                    headers: { Accept: 'json' },
                },
                {
                    requestHeaderFeatures: {
                        Accept: MatchingAttributes.DoesNotMatch,
                    },
                },
            );
            expect(mockedRequest).toEqual({
                method: 'GET',
                url: '/test-endpoint',
                headers: { Accept: { doesNotMatch: 'json' } },
            });
        });

        it('builds with method, endpoint, and queryParams', () => {
            const mockedRequest = testModule.createWireMockRequest({
                method: 'GET',
                endpoint: '/test-endpoint',
                queryParameters: {
                    a: 'test-val',
                    b: 1,
                },
            });
            expect(mockedRequest).toEqual({
                method: 'GET',
                url: '/test-endpoint',
                queryParameters: {
                    a: { equalTo: 'test-val' },
                    b: { equalTo: 1 },
                },
            });
        });

        it('builds with method, endpoint, and queryParams (with feature)', () => {
            const mockedRequest = testModule.createWireMockRequest(
                {
                    method: 'GET',
                    endpoint: '/test-endpoint',
                    queryParameters: {
                        a: 'test-val',
                        b: 1,
                    },
                },
                {
                    requestQueryParamFeatures: {
                        a: MatchingAttributes.Matches,
                    },
                },
            );
            expect(mockedRequest).toEqual({
                method: 'GET',
                url: '/test-endpoint',
                queryParameters: {
                    a: { matches: 'test-val' },
                    b: { equalTo: 1 },
                },
            });
        });
    });
});
