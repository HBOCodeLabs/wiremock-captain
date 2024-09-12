// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { EndpointFeature, MatchingAttributes } from '../../src';

describe('RequestModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe('createWireMockRequest', () => {
        test('builds with method and endpoint', () => {
            const testModule = require('../../src/RequestModel');
            const mockedRequest = testModule.createWireMockRequest({
                method: 'GET',
                endpoint: '/test-endpoint',
            });
            expect(mockedRequest).toEqual({
                method: 'GET',
                url: '/test-endpoint',
            });
        });

        test('builds with method and urlpath', () => {
            const testModule = require('../../src/RequestModel');
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

        test('builds with method, endpoint, and body', () => {
            const testModule = require('../../src/RequestModel');
            const mockedRequest = testModule.createWireMockRequest({
                method: 'GET',
                endpoint: '/test-endpoint',
                body: { testKey: 'testValue' },
            });
            expect(mockedRequest).toEqual({
                method: 'GET',
                url: '/test-endpoint',
                bodyPatterns: [
                    {
                        equalToJson: { testKey: 'testValue' },
                        ignoreArrayOrder: false,
                        ignoreExtraElements: false,
                    },
                ],
            });
        });

        test('builds with method, endpoint, and body (with feature)', () => {
            const testModule = require('../../src/RequestModel');
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

        test('builds with method, endpoint, and cookies', () => {
            const testModule = require('../../src/RequestModel');
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

        test('builds with method, endpoint, and cookies (with feature)', () => {
            const testModule = require('../../src/RequestModel');
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

        test('builds with method, endpoint, and headers', () => {
            const testModule = require('../../src/RequestModel');
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

        test('builds with method, endpoint, and headers (with feature)', () => {
            const testModule = require('../../src/RequestModel');
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

        test('builds with method, endpoint, queryParams, and formParameters', () => {
            const testModule = require('../../src/RequestModel');
            const mockedRequest = testModule.createWireMockRequest({
                method: 'GET',
                endpoint: '/test-endpoint',
                queryParameters: {
                    a: 'test-val',
                    b: 1,
                },
                formParameters: {
                    c: true,
                },
            });
            expect(mockedRequest).toEqual({
                method: 'GET',
                url: '/test-endpoint',
                queryParameters: {
                    a: { equalTo: 'test-val' },
                    b: { equalTo: 1 },
                },
                formParameters: {
                    c: { equalTo: true },
                },
            });
        });

        test('builds with method, endpoint, and queryParams (with feature)', () => {
            const testModule = require('../../src/RequestModel');
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
