// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { IWireMockRequest, IWireMockResponse, IWireMockFeatures } from '.';
import { IWireMockMockedRequestResponse, Method } from './IWireMockTypes';
import { WireMock } from './WireMock';

export class WireMockAPI extends WireMock {
    protected readonly endpoint: string;
    protected readonly method: Method;
    protected readonly features?: IWireMockFeatures;

    public constructor(
        baseUrl: string,
        endpoint: string,
        method: Method,
        features?: Omit<IWireMockFeatures, 'scenario' | 'stubPriority'>,
    ) {
        super(baseUrl);
        this.endpoint = endpoint;
        this.method = method;
        this.features = features;
    }

    /**
     * Creates a new stub with desired request and response match
     * @param request Request object for the stub mapping
     * @param response Response object for the stub mapping
     * @param features Additional options to be used for creation of stub mapping
     * @returns Created wiremock stub mapping. Contains `id` which is needed to delete a mapping
     */
    public async register(
        request: Omit<IWireMockRequest, 'endpoint' | 'method'>,
        response: IWireMockResponse,
        features?: IWireMockFeatures,
    ): Promise<IWireMockMockedRequestResponse> {
        return await super.register(
            { endpoint: this.endpoint, method: this.method, ...request },
            response,
            { ...this.features, ...features },
        );
    }

    /**
     * Creates a new default stub with desired response
     * @param response Response object for the stub mapping
     * @param features Additional options to be used for creation of stub mapping
     * @returns Created wiremock stub mapping. Contains `id` which is needed to delete a mapping
     */
    public async registerDefaultResponse(
        response: IWireMockResponse,
        features?: IWireMockFeatures,
    ): Promise<IWireMockMockedRequestResponse> {
        return await this.register({}, response, features);
    }

    /**
     * Returns list of request(s) made to the WireMock API
     * @returns List of wiremock requests made to the endpoint with given method
     */
    public async getRequestsForAPI(): Promise<unknown[]> {
        return await super.getRequestsForAPI(this.method, this.endpoint);
    }
}
