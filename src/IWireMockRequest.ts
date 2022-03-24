// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { KeyValue, Method } from './internalTypes';

export interface IWireMockRequest {
    body?: unknown;
    cookies?: Record<string, KeyValue>;
    endpoint: string;
    headers?: Record<string, KeyValue>;
    method: Method;
    queryParameters?: Record<string, KeyValue>;
}
