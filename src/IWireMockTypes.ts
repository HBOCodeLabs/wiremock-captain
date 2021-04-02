// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

export type Method = 'ANY' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'TRACE' | 'OPTIONS';

export type KeyValue = boolean | number | string;

export interface IRequestMock {
    method: Method;

    [key: string]: unknown;
}

export interface IResponseMock {
    status: number;
    headers?: Record<string, KeyValue>;

    [key: string]: unknown;
}

export interface IWireMockMockedRequestResponse {
    id: string;
    request: IRequestMock;
    response: IResponseMock;
    priority?: number;
}

export interface IWireMockScenario {
    scenarioName: string;
    requiredScenarioState: 'Started' | string;
    newScenarioState?: string;
}
