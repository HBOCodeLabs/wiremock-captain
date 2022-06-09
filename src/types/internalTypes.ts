// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { WireMockFault } from './externalTypes';

export interface IMockedRequestResponse {
    id: string;
    newScenarioState?: string;
    priority?: number;
    request: IRequestMock;
    requiredScenarioState?: string;
    response: IResponseMock;
    scenarioName?: string;
    uuid: number;
}

export interface IMockType {
    request: IRequestMock;
    response: IResponseMock;
    priority?: number;
    scenarioName?: string;
    requiredScenarioState?: string;
    newScenarioState?: string;
    postServeActions?: [IWebhook];
}

export interface IMappingGetResponse {
    mappings: Array<unknown>;
}

export interface IRequestGetResponse {
    requests: Array<unknown>;
}

export interface IRequestMock {
    method: Method;

    [key: string]: unknown;
}

export type IResponseMock =
    | {
          status: number;
          headers?: Record<string, KeyValue>;
          fixedDelayMilliseconds?: number;
          delayDistribution?: Record<string, number | string>;
          chunkedDribbleDelay?: Record<string, number>;

          [key: string]: unknown;
      }
    | {
          fault: WireMockFault;
      };

export interface IScenarioGetResponse {
    scenarios: Array<unknown>;
}

export interface IWebhook {
    name: 'webhook';
    parameters: {
        method: Method;
        url: string;
        headers?: Record<string, KeyValue>;
        body?: string;
        delay?: Record<string, number | string>;
    };
}

export type KeyValue = boolean | number | string;

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

export type WebhookBody =
    | { type: 'JSON'; data: Record<string, unknown> }
    | { type: 'String'; data: string };
