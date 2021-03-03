// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import fetch, { Response } from 'node-fetch';
import { IWireMockFeatures } from './IWireMockFeatures';
import { IWireMockRequest } from './IWireMockRequest';
import { IWireMockResponse } from './IWireMockResponse';
import { IWireMockMockedRequestResponse } from './IWireMockTypes';
import { createWireMockRequest } from './RequestModel';
import { createWireMockResponse } from './ResponseModel';

// endpoint where wiremock stores mocks
const WIREMOCK_MAPPINGS_URL = '__admin/mappings';
// endpoint that records all the incoming requests
const WIREMOCK_REQUESTS_URL = '__admin/requests';

export class WireMock {
    private readonly baseUrl: string;

    public constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Creates a new stub with desired request and response match
     * @param request Request object for the stub mapping
     * @param response Response object for the stub mapping
     * @param features Additional options to be used for creation of stub mapping
     * @returns Created wiremock stub mapping. Contains `id` which is needed to delete a mapping
     */
    public async register(
        request: IWireMockRequest,
        response: IWireMockResponse,
        features?: IWireMockFeatures,
    ): Promise<IWireMockMockedRequestResponse> {
        const mockedRequest = createWireMockRequest(request, features);
        const mockedResponse = createWireMockResponse(response, features);
        const mock = features?.stubPriority
            ? {
                  priority: features.stubPriority,
                  request: mockedRequest,
                  response: mockedResponse,
              }
            : {
                  request: mockedRequest,
                  response: mockedResponse,
              };
        const wiremockResponse = await fetch(this.makeUrl(WIREMOCK_MAPPINGS_URL), {
            method: 'POST',
            body: JSON.stringify(mock),
        });
        return await wiremockResponse.json();
    }

    /**
     * Removes all the existing stubs and logs of incoming requests
     */
    public clearAll(): Promise<Response[]> {
        return Promise.all([this.clearMappings(), this.clearRequests()]);
    }

    /**
     * Removes all existing stubs
     */
    public async clearMappings(): Promise<Response> {
        return await fetch(this.makeUrl(WIREMOCK_MAPPINGS_URL), {
            method: 'DELETE',
        });
    }

    /**
     * Removes log of all past incoming requests
     */
    public async clearRequests(): Promise<Response> {
        return await fetch(this.makeUrl(WIREMOCK_REQUESTS_URL), {
            method: 'DELETE',
        });
    }

    /**
     * Deletes a stub mapping
     * @param id ID of the stub to be deleted. Can be obtained when from response of `register()`
     */
    public async deleteMapping(id: string): Promise<Response> {
        return await fetch(this.makeUrl(WIREMOCK_MAPPINGS_URL + '/' + id), {
            method: 'DELETE',
        });
    }

    /**
     * Returns all the request and response mappings attached to the wiremock instance
     * @returns Collection of all mappings for the wiremock instance
     */
    public async getAllMappings(): Promise<unknown> {
        const response = await fetch(this.makeUrl(WIREMOCK_MAPPINGS_URL), {
            method: 'GET',
        });
        const responseJson = await response.json();
        return responseJson.mappings;
    }

    /**
     * Returns information about the mocked request and response corresponding to the `id`
     * @param id Mapping ID to get the mapping info for
     * @returns Single object mapping corresponding to the input `id`
     */
    public async getMapping(id: string): Promise<unknown> {
        const response = await fetch(this.makeUrl(WIREMOCK_MAPPINGS_URL + '/' + id), {
            method: 'GET',
        });
        return await response.json();
    }

    /**
     * Returns list of request(s) made to the WireMock instance
     * @param method Method to match the request(s) made against
     * @param endpointUrl URL to get the request(s) made against
     * @returns List of wiremock requests made to the endpoint with given method
     */
    public async requests(method: string, endpointUrl: string): Promise<IWireMockRequest[]> {
        const response = await fetch(this.makeUrl(WIREMOCK_REQUESTS_URL), {
            method: 'GET',
        });
        const body = await response.json();
        return (
            body.requests
                .filter(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (request: any) =>
                        request.request.method === method && request.request.url === endpointUrl,
                )
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((request: any) => {
                    const parsedRequestBody = parseBody(request.request.body);
                    if (parsedRequestBody) {
                        return {
                            endpoint: request.request.url,
                            method: request.request.method,
                            body: parsedRequestBody,
                            headers: request.request.headers,
                            queryParams: request.request.queryParams,
                        };
                    }
                    return {
                        endpoint: request.request.url,
                        method: request.request.method,
                        headers: request.request.headers,
                        queryParams: request.request.queryParams,
                    };
                })
        );
    }

    private makeUrl(endpoint: string) {
        return new URL(endpoint, this.baseUrl).href;
    }
}

function parseBody(body: string) {
    try {
        return JSON.parse(body);
    } catch {
        return;
    }
}
