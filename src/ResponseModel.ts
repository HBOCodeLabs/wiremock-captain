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

    if (body) {
        const bodyType: string = features?.responseBodyType || BodyType.Default;
        mockedResponse[bodyType] = body;
    }

    if (headers) {
        mockedResponse.headers = headers;
    }

    return mockedResponse;
}
