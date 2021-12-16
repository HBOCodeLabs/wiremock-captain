// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { BodyType, IWireMockFeatures } from './IWireMockFeatures';
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

    if (headers) {
        mockedResponse.headers = {
            ...(bodyType === BodyType.Default && {
                'Content-Type': 'application/json; charset=utf-8',
            }),
            ...headers,
        };
    }

    return mockedResponse;
}
