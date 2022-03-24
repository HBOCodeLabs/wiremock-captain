// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { KeyValue, Method, WebhookBody } from './internalTypes';

export interface IWireMockScenario {
    scenarioName: string;
    requiredScenarioState: 'Started' | string;
    newScenarioState?: string;
}

export interface IChunkedDribbleDelay {
    type: DelayType.CHUNKED_DRIBBLE;
    numberOfChunks: number;
    totalDuration: number;
}

export interface IFixedDelay {
    type: DelayType.FIXED;
    constantDelay: number;
}

export interface ILogNormalDelay {
    type: DelayType.LOG_NORMAL;
    median: number;
    sigma: number;
}

export interface IUniformDelay {
    type: DelayType.UNIFORM;
    lower: number;
    upper: number;
}

export interface IWireMockWebhook {
    method: Method;
    url: string;
    headers?: Record<string, KeyValue>;
    body?: WebhookBody;
    delay?: WireMockDelay;
}

export const enum BodyType {
    Default = 'jsonBody',
    Body = 'body',
    Base64Body = 'base64Body',
}

export const enum DelayType {
    CHUNKED_DRIBBLE = 'CHUNKED_DRIBBLE',
    FIXED = 'FIXED',
    LOG_NORMAL = 'LOG_NORMAL',
    UNIFORM = 'UNIFORM',
}

export const enum EndpointFeature {
    Default = 'url',
    UrlPath = 'urlPath',
    UrlPathPattern = 'urlPathPattern',
    UrlPattern = 'urlPattern',
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

export type WireMockDelay = IChunkedDribbleDelay | IFixedDelay | ILogNormalDelay | IUniformDelay;
