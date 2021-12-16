// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { EndpointFeature, IWireMockFeatures, MatchingAttributes } from './IWireMockFeatures';
import { IWireMockRequest } from './IWireMockRequest';
import { IRequestMock, KeyValue } from './IWireMockTypes';

export function createWireMockRequest(
    request: IWireMockRequest,
    features?: IWireMockFeatures,
): IRequestMock {
    const { body, cookies, headers, method, queryParameters, endpoint } = request;
    const endpointFeature: string = features?.requestEndpointFeature ?? EndpointFeature.Default;

    const mock: IRequestMock = {
        method,
    };
    mock[endpointFeature] = endpoint;

    if (body) {
        const bodyFeature: string = features?.requestBodyFeature ?? MatchingAttributes.EqualToJson;
        const mockBody: { [key: string]: unknown } = {};
        mockBody[bodyFeature] = body;
        mock.bodyPatterns = [mockBody];
    }

    if (cookies) {
        mock.cookies = getMockedObject(cookies, features?.requestCookieFeatures);
    }

    if (headers) {
        mock.headers = getMockedObject(headers, features?.requestHeaderFeatures);
    }

    if (queryParameters) {
        mock.queryParameters = getMockedObject(
            queryParameters,
            features?.requestQueryParamFeatures,
        );
    }

    return mock;
}

/**
 * Maps cookies, headers, and queryParameters to wiremock schema
 * @param {Record<string, KeyValue>} dict
 * @param {Record<string, MatchingAttributes>} dictMatchingAttributes
 * @returns {{[p: string]: any}}
 */
function getMockedObject(
    dict: Record<string, KeyValue>,
    dictMatchingAttributes?: Record<string, MatchingAttributes>,
): Record<string, unknown> {
    const mockObject: { [key: string]: unknown } = {};
    for (const key of Object.keys(dict)) {
        mockObject[key] = mapPropertyToAttribute(
            dict[key],
            dictMatchingAttributes?.[key] ?? MatchingAttributes.EqualTo,
        );
    }
    return mockObject;
}

function mapPropertyToAttribute(
    value: KeyValue,
    attribute: MatchingAttributes,
): Record<string, KeyValue> {
    return {
        [attribute]: value,
    };
}
