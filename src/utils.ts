// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { DelayType, WireMockDelay } from './externalTypes';
import { Method, WebhookBody } from './internalTypes';

export function filterRequest(method: Method, endpointUrl: string, request: any): boolean {
    return request.request.method === method && request.request.url === endpointUrl;
}

export function getWebhookBody(body: WebhookBody): string {
    switch (body.type) {
        case 'JSON':
            return JSON.stringify(body.data);
        case 'String':
            return body.data;
    }
}

export function getWebhookDelayBody(delay: WireMockDelay): Record<string, number | string> {
    switch (delay.type) {
        case DelayType.FIXED:
            return { type: 'fixed', milliseconds: delay.constantDelay };
        case DelayType.LOG_NORMAL:
            return { type: 'lognormal', median: delay.median, sigma: delay.sigma };
        case DelayType.UNIFORM:
            return { type: 'uniform', lower: delay.lower, upper: delay.upper };
        default:
            throw new Error('unsupported webhook delay type');
    }
}
