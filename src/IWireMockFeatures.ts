// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { IWireMockScenario } from './IWireMockTypes';

/**
 * Specifies all possible attributes that can be assigned to mocked request or response.
 * Be default, all matches happen on equality but this extends the functionality.
 * Can be provided partially or completely based on the use case.
 * For more info how each of these work, visit: http://wiremock.org/docs/
 */
export interface IWireMockFeatures {
    requestBodyFeature?: MatchingAttributes;
    requestCookieFeatures?: Record<string, MatchingAttributes>;
    requestEndpointFeature?: EndpointFeature;
    requestHeaderFeatures?: Record<string, MatchingAttributes>;
    requestQueryParamFeatures?: Record<string, MatchingAttributes>;
    responseBodyType?: BodyType;
    /**
     * All the scenarios start from state `Started`
     */
    scenario?: IWireMockScenario;
    /**
     * Lower the value, higher the priority
     */
    stubPriority?: number;
}

export const enum BodyType {
    Default = 'jsonBody',
    Body = 'body',
    Base64Body = 'base64Body',
}

export const enum MatchingAttributes {
    BinaryEqualTo = 'binaryEqualTo',
    Contains = 'contains',
    DoesNotMatch = 'doesNotMatch',
    EqualTo = 'equalTo',
    EqualToJson = 'equalToJson',
    Matches = 'matches',
    MatchesJsonPath = 'matchesJsonPath',
}

export const enum EndpointFeature {
    Default = 'url',
    UrlPath = 'urlPath',
    UrlPathPattern = 'urlPathPattern',
    UrlPattern = 'urlPattern',
}
