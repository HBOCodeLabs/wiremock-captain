// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { BodyType, DelayType, IWireMockFeatures } from './IWireMockFeatures';
import { IWireMockResponse } from './IWireMockResponse';
import { IResponseMock } from './IWireMockTypes';

export function createWireMockResponse(
    response: IWireMockResponse,
    features?: IWireMockFeatures,
): IResponseMock {
    const { body, headers, status } = response;
    const mockedResponse: IResponseMock = {
        status,
    };
    const bodyType: string = features?.responseBodyType ?? BodyType.Default;

    if (body) {
        mockedResponse[bodyType] = body;
    }

    mockedResponse.headers = {
        ...(bodyType === BodyType.Default && {
            'Content-Type': 'application/json; charset=utf-8',
        }),
        ...headers,
    };

    const delay = features?.responseDelay;

    switch (delay?.type) {
        case DelayType.CHUNKED_DRIBBLE:
            mockedResponse.chunkedDribbleDelay = {
                numberOfChunks: delay.numberOfChunks,
                totalDuration: delay.totalDuration,
            };
            break;
        case DelayType.FIXED:
            mockedResponse.fixedDelayMilliseconds = delay.constantDelay;
            break;
        case DelayType.LOG_NORMAL:
            mockedResponse.delayDistribution = {
                type: 'lognormal',
                median: delay.median,
                sigma: delay.sigma,
            };
            break;
        case DelayType.UNIFORM:
            mockedResponse.delayDistribution = {
                type: 'uniform',
                lower: delay.lower,
                upper: delay.upper,
            };
            break;
        default:
    }

    return mockedResponse;
}
