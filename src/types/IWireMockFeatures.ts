// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import {
    BodyType,
    EndpointFeature,
    IWireMockScenario,
    IWireMockWebhook,
    MatchingAttributes,
    ResponseTransformer,
    WireMockDelay,
    WireMockFault,
} from './externalTypes';

/**
 * Specifies all possible attributes that can be assigned to mocked request or response.
 * Be default, all matches happen on equality but this extends the functionality.
 * Can be provided partially or completely based on the use case.
 * For more info how each of these work, visit: http://wiremock.org/docs/
 */
export interface IWireMockFeatures {
    /**
     * If provided, will override any response status and body
     */
    fault?: WireMockFault;
    requestBodyFeature?: MatchingAttributes;
    requestCookieFeatures?: Record<string, MatchingAttributes>;
    requestEndpointFeature?: EndpointFeature;
    requestHeaderFeatures?: Record<string, MatchingAttributes>;
    requestQueryParamFeatures?: Record<string, MatchingAttributes>;
    requestFormParameterFeatures?: Record<string, MatchingAttributes>;
    requestIgnoreArrayOrder?: boolean;
    requestIgnoreExtraElements?: boolean;
    responseBodyType?: BodyType;
    responseDelay?: WireMockDelay;
    /**
     * All the scenarios start from state `Started`
     */
    scenario?: IWireMockScenario;
    /**
     * Lower the value, higher the priority
     */
    stubPriority?: number;
    webhook?: IWireMockWebhook;
    responseTransformers?: ResponseTransformer[];
}
