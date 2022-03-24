// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { KeyValue } from './internalTypes';

export interface IWireMockResponse {
    body?: unknown;
    headers?: Record<string, KeyValue>;
    status: number;
}
