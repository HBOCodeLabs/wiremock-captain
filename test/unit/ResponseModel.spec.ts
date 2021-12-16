// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { BodyType } from '../../src';

describe('ResponseModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe('createWireMockResponse', () => {
        it('builds with statusCode', () => {
            const testModule: typeof import('../../src/ResponseModel') = require('../../src/ResponseModel');
            const mockedResponse = testModule.createWireMockResponse({
                status: 200,
            });
            expect(mockedResponse).toEqual({ status: 200 });
        });

        it('builds with statusCode and body', () => {
            const testModule: typeof import('../../src/ResponseModel') = require('../../src/ResponseModel');
            const mockedResponse = testModule.createWireMockResponse({
                status: 200,
                body: { testKey: 'test-value' },
            });
            expect(mockedResponse).toEqual({
                status: 200,
                jsonBody: { testKey: 'test-value' },
            });
        });

        it('builds with statusCode and body (with feature)', () => {
            const testModule: typeof import('../../src/ResponseModel') = require('../../src/ResponseModel');
            const mockedResponse = testModule.createWireMockResponse(
                {
                    status: 200,
                    body: { testKey: 'test-value' },
                },
                { responseBodyType: BodyType.Body },
            );
            expect(mockedResponse).toEqual({
                status: 200,
                body: { testKey: 'test-value' },
            });
        });

        it('builds with statusCode and headers', () => {
            const testModule: typeof import('../../src/ResponseModel') = require('../../src/ResponseModel');
            const mockedResponse = testModule.createWireMockResponse({
                status: 200,
                headers: { Accept: 'json' },
            });
            expect(mockedResponse).toEqual({
                status: 200,
                headers: { Accept: 'json', 'Content-Type': 'application/json; charset=utf-8' },
            });
        });
    });
});
