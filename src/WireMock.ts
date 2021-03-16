// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import fetch, { Response } from 'node-fetch';
import { IWireMockFeatures } from './IWireMockFeatures';
import { IWireMockRequest } from './IWireMockRequest';
import { IWireMockResponse } from './IWireMockResponse';
import { IRequestMock, IResponseMock, IWireMockMockedRequestResponse } from './IWireMockTypes';
import { createWireMockRequest } from './RequestModel';
import { createWireMockResponse } from './ResponseModel';

// endpoint where wiremock stores mocks
const WIREMOCK_MAPPINGS_URL = '__admin/mappings';
// endpoint that records all the incoming requests
const WIREMOCK_REQUESTS_URL = '__admin/requests';
// endpoint that records all the scenario information
const WIREMOCK_SCENARIO_URL = '__admin/scenarios';

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
        let mock: mockType = {
            request: mockedRequest,
            response: mockedResponse,
        };

        if (features?.stubPriority) {
            mock.priority = features.stubPriority;
        }

        if (features?.scenario) {
            mock = { ...mock, ...features.scenario };
        }

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
        return Promise.all([this.clearAllMappings(), this.clearAllRequests()]);
    }

    /**
     * Removes all existing stubs
     */
    public async clearAllMappings(): Promise<Response> {
        return await fetch(this.makeUrl(WIREMOCK_MAPPINGS_URL), {
            method: 'DELETE',
        });
    }

    /**
     * Removes log of all past incoming requests
     */
    public async clearAllRequests(): Promise<Response> {
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
     * @returns List of all requests made to the mocked instance
     */
    public async getAllRequests(): Promise<unknown[]> {
        const response = await fetch(this.makeUrl(WIREMOCK_REQUESTS_URL), {
            method: 'GET',
        });
        const body = await response.json();
        return body.requests;
    }

    /**
     * @returns List of all scenarios in place for the mocked instance
     */
    public async getAllScenarios(): Promise<unknown[]> {
        const response = await fetch(this.makeUrl(WIREMOCK_SCENARIO_URL), {
            method: 'GET',
        });
        const body = await response.json();
        return body.scenarios;
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
    public async getRequestsForAPI(method: string, endpointUrl: string): Promise<unknown[]> {
        const response = await fetch(this.makeUrl(WIREMOCK_REQUESTS_URL), {
            method: 'GET',
        });
        const body = await response.json();
        return (
            body.requests
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((r: any) => filterRequest(method, endpointUrl, r))
        );
    }

    /**
     * Returns list of unmatched request(s)
     * @returns List of wiremock requests made that did not match any mapping
     */
    public async getUnmatchedRequests(): Promise<unknown[]> {
        const response = await fetch(this.makeUrl(WIREMOCK_REQUESTS_URL + '/unmatched'), {
            method: 'GET',
        });
        const body = await response.json();
        return body.requests;
    }

    /**
     * Resets all the scenarios to the original state
     */
    public async resetAllScenarios(): Promise<Response> {
        return await fetch(this.makeUrl(WIREMOCK_SCENARIO_URL + '/reset'), {
            method: 'POST',
        });
    }

    private makeUrl(endpoint: string) {
        return new URL(endpoint, this.baseUrl).href;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterRequest(method: string, endpointUrl: string, request: any): boolean {
    return request.request.method === method && request.request.url === endpointUrl;
}

type mockType = {
    request: IRequestMock;
    response: IResponseMock;
    priority?: number;
    scenarioName?: string;
    requiredScenarioState?: string;
    newScenarioState?: string;
};
