// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { BodyType, DelayType } from '../../src';

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
            expect(mockedResponse).toEqual({
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
            });
        });

        it('builds with statusCode and body', () => {
            const testModule: typeof import('../../src/ResponseModel') = require('../../src/ResponseModel');
            const mockedResponse = testModule.createWireMockResponse({
                status: 200,
                body: { testKey: 'test-value' },
            });
            expect(mockedResponse).toEqual({
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
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
                headers: {},
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

        it('should build response with chunked dribble delay', () => {
            const testModule: typeof import('../../src/ResponseModel') = require('../../src/ResponseModel');
            const mockedResponse = testModule.createWireMockResponse(
                {
                    status: 200,
                },
                {
                    responseDelay: {
                        type: DelayType.CHUNKED_DRIBBLE,
                        numberOfChunks: 1,
                        totalDuration: 100,
                    },
                },
            );
            expect(mockedResponse).toEqual({
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                chunkedDribbleDelay: {
                    numberOfChunks: 1,
                    totalDuration: 100,
                },
            });
        });

        it('should build response with fixed delay', () => {
            const testModule: typeof import('../../src/ResponseModel') = require('../../src/ResponseModel');
            const mockedResponse = testModule.createWireMockResponse(
                {
                    status: 200,
                },
                { responseDelay: { type: DelayType.FIXED, constantDelay: 100 } },
            );
            expect(mockedResponse).toEqual({
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                fixedDelayMilliseconds: 100,
            });
        });

        it('should build response with log normal delay', () => {
            const testModule: typeof import('../../src/ResponseModel') = require('../../src/ResponseModel');
            const mockedResponse = testModule.createWireMockResponse(
                {
                    status: 200,
                },
                {
                    responseDelay: {
                        type: DelayType.LOG_NORMAL,
                        median: 5,
                        sigma: 10,
                    },
                },
            );
            expect(mockedResponse).toEqual({
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                delayDistribution: {
                    type: 'lognormal',
                    median: 5,
                    sigma: 10,
                },
            });
        });

        it('should build response with log normal delay', () => {
            const testModule: typeof import('../../src/ResponseModel') = require('../../src/ResponseModel');
            const mockedResponse = testModule.createWireMockResponse(
                {
                    status: 200,
                },
                {
                    responseDelay: {
                        type: DelayType.UNIFORM,
                        lower: 5,
                        upper: 10,
                    },
                },
            );
            expect(mockedResponse).toEqual({
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                delayDistribution: {
                    type: 'uniform',
                    lower: 5,
                    upper: 10,
                },
            });
        });
    });
});
