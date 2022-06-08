// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios';

import {
    IMappingGetResponse,
    IMockedRequestResponse,
    IMockType,
    IRequestGetResponse,
    IScenarioGetResponse,
    Method,
} from './types/internalTypes';
import { IWireMockFeatures } from './types/IWireMockFeatures';
import { IWireMockRequest } from './types/IWireMockRequest';
import { IWireMockResponse } from './types/IWireMockResponse';
import { createWireMockRequest } from './RequestModel';
import { createWireMockResponse } from './ResponseModel';
import { filterRequest, getWebhookBody, getWebhookDelayBody } from './utils';

// endpoint where wiremock stores mocks
const WIREMOCK_MAPPINGS_URL: string = '__admin/mappings';
// endpoint that records all the incoming requests
const WIREMOCK_REQUESTS_URL: string = '__admin/requests';
// endpoint that records all the scenario information
const WIREMOCK_SCENARIO_URL: string = '__admin/scenarios';

const HEADERS: AxiosRequestHeaders = { 'Content-Type': 'application/json' };

export class WireMock {
    protected readonly baseUrl: string;

    public constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Creates a new stub with desired request and response match
     * @param request Request object for the stub mapping
     * @param response AxiosResponse object for the stub mapping
     * @param features Additional options to be used for creation of stub mapping
     * @returns Created wiremock stub mapping. Contains `id` which is needed to delete a mapping
     */
    public async register(
        request: IWireMockRequest,
        response: IWireMockResponse,
        features?: IWireMockFeatures,
    ): Promise<IMockedRequestResponse> {
        const mockedRequest = createWireMockRequest(request, features);
        const mockedResponse = createWireMockResponse(response, features);
        let mock: IMockType = {
            request: mockedRequest,
            response: mockedResponse,
        };

        if (features?.stubPriority) {
            mock.priority = features.stubPriority;
        }

        if (features?.scenario) {
            mock = { ...mock, ...features.scenario };
        }

        if (features?.webhook) {
            mock.postServeActions = [
                {
                    name: 'webhook',
                    parameters: {
                        method: features.webhook.method,
                        url: features.webhook.url,
                        ...(features.webhook.headers && { headers: features.webhook.headers }),
                        ...(features.webhook.body && {
                            body: getWebhookBody(features.webhook.body),
                        }),
                        ...(features.webhook.delay && {
                            delay: getWebhookDelayBody(features.webhook.delay),
                        }),
                    },
                },
            ];
        }

        if (features?.fault) {
            mock.response = { fault: features.fault };
        }

        const wiremockResponse = await axios.post(this.makeUrl(WIREMOCK_MAPPINGS_URL), mock, {
            headers: HEADERS,
        });

        return wiremockResponse.data;
    }

    /**
     * Removes all the existing stubs and logs of incoming requests
     */
    public clearAll(): Promise<AxiosResponse[]> {
        return Promise.all([this.clearAllMappings(), this.clearAllRequests()]);
    }

    /**
     * Removes all the non-default mappings (not defined in backing store)
     * and logs of incoming requests
     */
    public clearAllExceptDefault(): Promise<AxiosResponse[]> {
        return Promise.all([this.resetMappings(), this.clearAllRequests()]);
    }

    /**
     * Removes all existing stubs
     */
    public async clearAllMappings(): Promise<AxiosResponse> {
        return await axios.delete(this.makeUrl(WIREMOCK_MAPPINGS_URL));
    }

    /**
     * Removes log of all past incoming requests
     */
    public async clearAllRequests(): Promise<AxiosResponse> {
        return await axios.delete(this.makeUrl(WIREMOCK_REQUESTS_URL));
    }

    /**
     * Deletes a stub mapping
     * @param id ID of the stub to be deleted. Can be obtained when from response of `register()`
     */
    public async deleteMapping(id: string): Promise<AxiosResponse> {
        return await axios.delete(this.makeUrl(WIREMOCK_MAPPINGS_URL + '/' + id));
    }

    /**
     * Returns all the request and response mappings attached to the wiremock instance
     * @returns Collection of all mappings for the wiremock instance
     */
    public async getAllMappings(): Promise<unknown[]> {
        const response = await axios.get(this.makeUrl(WIREMOCK_MAPPINGS_URL));
        const responseJson = response.data as IMappingGetResponse;
        return responseJson.mappings;
    }

    /**
     * @returns List of all requests made to the mocked instance
     */
    public async getAllRequests(): Promise<unknown[]> {
        const response = await axios.get(this.makeUrl(WIREMOCK_REQUESTS_URL));
        const responseJson = response.data as IRequestGetResponse;
        return responseJson.requests;
    }

    /**
     * @returns List of all scenarios in place for the mocked instance
     */
    public async getAllScenarios(): Promise<unknown[]> {
        const response = await axios.get(this.makeUrl(WIREMOCK_SCENARIO_URL));
        const responseJson = response.data as IScenarioGetResponse;
        return responseJson.scenarios;
    }

    /**
     * Returns information about the mocked request and response corresponding to the `id`
     * @param id Mapping ID to get the mapping info for
     * @returns Single object mapping corresponding to the input `id`
     */
    public async getMapping(id: string): Promise<unknown> {
        const response = await axios.get(this.makeUrl(WIREMOCK_MAPPINGS_URL + '/' + id));
        return await response.data;
    }

    /**
     * Returns list of request(s) made to the WireMock API
     * @param method Method to match the request(s) made against
     * @param endpointUrl URL to get the request(s) made against
     * @returns List of wiremock requests made to the endpoint with given method
     */
    public async getRequestsForAPI(method: Method, endpointUrl: string): Promise<unknown[]> {
        const response = await axios.get(this.makeUrl(WIREMOCK_REQUESTS_URL));
        const body = response.data as IRequestGetResponse;
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
        const response = await axios.get(this.makeUrl(WIREMOCK_REQUESTS_URL + '/unmatched'));
        const body = response.data as IRequestGetResponse;
        return body.requests;
    }

    /**
     * Resets all the scenarios to the original state
     */
    public async resetAllScenarios(): Promise<AxiosResponse> {
        return await axios.post(this.makeUrl(WIREMOCK_SCENARIO_URL + '/reset'));
    }

    /**
     * Restores stub mappings to the defaults defined back in the backing store
     */
    public async resetMappings(): Promise<AxiosResponse> {
        return await axios.post(this.makeUrl(WIREMOCK_MAPPINGS_URL + '/reset'));
    }

    protected makeUrl(endpoint: string): string {
        return new URL(endpoint, this.baseUrl).href;
    }
}
