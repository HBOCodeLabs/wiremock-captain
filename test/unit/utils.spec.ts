// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { afterEach, expect, jest } from '@jest/globals';

import { DelayType } from '../../src';

describe('utils', () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    describe('getWebhookBody', () => {
        it('should return correct body for json', () => {
            const utils = require('../../src/utils');
            const resp = utils.getWebhookBody({ type: 'JSON', data: { a: 1 } });
            expect(resp).toEqual(JSON.stringify({ a: 1 }));
        });

        it('should return correct body for string', () => {
            const utils = require('../../src/utils');
            const resp = utils.getWebhookBody({ type: 'String', data: 'abc' });
            expect(resp).toEqual('abc');
        });
    });

    describe('', () => {
        it('should return correct body for fixed delay', () => {
            const utils = require('../../src/utils');
            const resp = utils.getWebhookDelayBody({ type: DelayType.FIXED, constantDelay: 100 });
            expect(resp).toEqual({
                type: 'fixed',
                milliseconds: 100,
            });
        });

        it('should return correct body for lognormal delay', () => {
            const utils = require('../../src/utils');
            const resp = utils.getWebhookDelayBody({
                type: DelayType.LOG_NORMAL,
                median: 5,
                sigma: 10,
            });
            expect(resp).toEqual({
                type: 'lognormal',
                median: 5,
                sigma: 10,
            });
        });

        it('should return correct body for uniform delay', () => {
            const utils = require('../../src/utils');
            const resp = utils.getWebhookDelayBody({
                type: DelayType.UNIFORM,
                lower: 5,
                upper: 10,
            });
            expect(resp).toEqual({
                type: 'uniform',
                lower: 5,
                upper: 10,
            });
        });

        it('should error for chunked dribble delay', () => {
            const utils = require('../../src/utils');
            expect(() =>
                utils.getWebhookDelayBody({
                    type: DelayType.CHUNKED_DRIBBLE,
                    numberOfChunks: 5,
                    totalDuration: 10,
                }),
            ).toThrow();
        });
    });
});
