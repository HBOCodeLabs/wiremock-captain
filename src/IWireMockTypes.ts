// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

export type Method =
    | 'ANY'
    | 'CONNECT'
    | 'DELETE'
    | 'GET'
    | 'HEAD'
    | 'OPTIONS'
    | 'PATCH'
    | 'POST'
    | 'PUT'
    | 'TRACE';

export type KeyValue = boolean | number | string;

export interface IRequestMock {
    method: Method;

    [key: string]: unknown;
}

export interface IResponseMock {
    status: number;
    headers?: Record<string, KeyValue>;
    fixedDelayMilliseconds?: number;
    delayDistribution?: Record<string, number | string>;
    chunkedDribbleDelay?: Record<string, number>;

    [key: string]: unknown;
}

export interface IWireMockMockedRequestResponse {
    id: string;
    newScenarioState?: string;
    priority?: number;
    request: IRequestMock;
    requiredScenarioState?: string;
    response: IResponseMock;
    scenarioName?: string;
    uuid: number;
}

export interface IWireMockScenario {
    scenarioName: string;
    requiredScenarioState: 'Started' | string;
    newScenarioState?: string;
}
