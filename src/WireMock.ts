// Copyright (c) WarnerMedia Direct, LLC. All rights reserved. Licensed under the MIT license.
// See the LICENSE file for license information.

import { createWireMockRequest } from './RequestModel';
import { createWireMockResponse } from './ResponseModel';
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
import { filterRequest, getWebhookBody, getWebhookDelayBody } from './utils';
import { MatchingAttributes } from './types/externalTypes';

// endpoint where wiremock stores mocks
const WIREMOCK_MAPPINGS_URL = '__admin/mappings';
// endpoint that records all the incoming requests
const WIREMOCK_REQUESTS_URL = '__admin/requests';
// endpoint that records all the scenario information
const WIREMOCK_SCENARIO_URL = '__admin/scenarios';

const HEADERS = { 'Content-Type': 'application/json' };

export class WireMock {
    protected readonly baseUrl: string;
    protected readonly features: IWireMockFeatures;

    public constructor(
        baseUrl: string,
        features?: Omit<IWireMockFeatures, 'scenario' | 'stubPriority'>,
    ) {
        this.baseUrl = baseUrl;
        this.features = features ?? {};
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
        const mergedFeatures = this.mergeWireMockFeatures(features);
        const mockedRequest = createWireMockRequest(request, mergedFeatures);
        const mockedResponse = createWireMockResponse(response, mergedFeatures);
        let mock: IMockType = {
            request: mockedRequest,
            response: mockedResponse,
        };

        if (mergedFeatures?.stubPriority) {
            mock.priority = mergedFeatures.stubPriority;
        }

        if (mergedFeatures?.scenario) {
            mock = { ...mock, ...mergedFeatures.scenario };
        }

        if (mergedFeatures?.webhook) {
            mock.postServeActions = [
                {
                    name: 'webhook',
                    parameters: {
                        method: mergedFeatures.webhook.method,
                        url: mergedFeatures.webhook.url,
                        ...(mergedFeatures.webhook.headers && {
                            headers: mergedFeatures.webhook.headers,
                        }),
                        ...(mergedFeatures.webhook.body && {
                            body: getWebhookBody(mergedFeatures.webhook.body),
                        }),
                        ...(mergedFeatures.webhook.delay && {
                            delay: getWebhookDelayBody(mergedFeatures.webhook.delay),
                        }),
                    },
                },
            ];
        }

        if (mergedFeatures?.fault) {
            mock.response = { fault: mergedFeatures.fault };
        }

        if (request.metadata) {
            mock.metadata = request.metadata;
        }

        const wiremockResponse = await fetch(this.makeUrl(WIREMOCK_MAPPINGS_URL), {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(mock),
        });

        return (await wiremockResponse.json()) as IMockedRequestResponse;
    }

    /**
     * Removes all the existing stubs and logs of incoming requests
     */
    public clearAll(): Promise<Response[]> {
        return Promise.all([this.clearAllMappings(), this.clearAllRequests()]);
    }

    /**
     * Removes all the non-default mappings (not defined in backing store)
     * and logs of incoming requests
     */
    public clearAllExceptDefault(): Promise<Response[]> {
        return Promise.all([this.resetMappings(), this.clearAllRequests()]);
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
        const response = await fetch(this.makeUrl(WIREMOCK_REQUESTS_URL), {
            method: 'DELETE',
        });

        return response;
    }

    /**
     * Deletes a stub mapping
     * @param id ID of the stub to be deleted. Can be obtained when from response of `register()`
     */
    public async deleteMapping(id: string): Promise<Response> {
        const response = await fetch(this.makeUrl(`${WIREMOCK_MAPPINGS_URL}/${id}`), {
            method: 'DELETE',
        });

        return response;
    }

    /**
     * Returns all the request and response mappings attached to the wiremock instance
     * @returns Collection of all mappings for the wiremock instance
     */
    public async getAllMappings(): Promise<unknown[]> {
        const response = await fetch(this.makeUrl(WIREMOCK_MAPPINGS_URL), {
            method: 'GET',
        });

        const responseJson: IMappingGetResponse = (await response.json()) as IMappingGetResponse;
        return responseJson.mappings;
    }

    /**
     * @returns List of all requests made to the mocked instance
     */
    public async getAllRequests(): Promise<unknown[]> {
        const response = await fetch(this.makeUrl(WIREMOCK_REQUESTS_URL), { method: 'GET' });
        const responseJson: IRequestGetResponse = (await response.json()) as IRequestGetResponse;
        return responseJson.requests;
    }

    /**
     * @returns List of all scenarios in place for the mocked instance
     */
    public async getAllScenarios(): Promise<unknown[]> {
        const response = await fetch(this.makeUrl(WIREMOCK_SCENARIO_URL), { method: 'GET' });
        const responseJson: IScenarioGetResponse = (await response.json()) as IScenarioGetResponse;
        return responseJson.scenarios;
    }

    /**
     * Returns information about the mocked request and response corresponding to the `id`
     * @param id Mapping ID to get the mapping info for
     * @returns Single object mapping corresponding to the input `id`
     */
    public async getMapping(id: string): Promise<unknown> {
        const response = await fetch(this.makeUrl(`${WIREMOCK_MAPPINGS_URL}/${id}`), {
            method: 'GET',
        });
        return await response.json();
    }

    /**
     * Returns list of request(s) made to the WireMock API
     * @param method Method to match the request(s) made against
     * @param endpointUrl URL to get the request(s) made against
     * @returns List of wiremock requests made to the endpoint with given method
     */
    public async getRequestsForAPI(method: Method, endpointUrl: string): Promise<unknown[]> {
        const response = await fetch(this.makeUrl(WIREMOCK_REQUESTS_URL), { method: 'GET' });
        const body: IRequestGetResponse = (await response.json()) as IRequestGetResponse;
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
        const body: IRequestGetResponse = (await response.json()) as IRequestGetResponse;
        return body.requests;
    }

    /**
     * Resets all the scenarios to the original state
     */
    public async resetAllScenarios(): Promise<Response> {
        const response = await fetch(this.makeUrl(WIREMOCK_SCENARIO_URL + '/reset'), {
            method: 'POST',
        });
        return response;
    }

    /**
     * Restores stub mappings to the defaults defined back in the backing store
     */
    public async resetMappings(): Promise<Response> {
        const response = await fetch(this.makeUrl(WIREMOCK_MAPPINGS_URL + '/reset'), {
            method: 'POST',
        });
        return response;
    }

    /**
     * Finds a mapping by metadata.
     * @param matchObject - The object containing metadata to match.
     * @param matchType - The type of matching attributes.
     * @returns The found mappings.
     */
    public async findMappingByMetadata(
        matchObject: Record<string, unknown>,
        matchType: MatchingAttributes,
    ): Promise<unknown[]> {
        const response = await fetch(this.makeUrl(WIREMOCK_MAPPINGS_URL + '/find-by-metadata'), {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ [matchType]: matchObject }),
        });
        return ((await response.json()) as IMappingGetResponse).mappings;
    }

    /**
     * Removes a mapping by metadata.
     * @param matchObject - The object containing metadata to match.
     * @param matchType - The type of matching attributes.
     * @returns The result of the removal operation.
     */
    public async removeMappingByMetadata(
        matchObject: Record<string, unknown>,
        matchType: MatchingAttributes,
    ): Promise<unknown> {
        const response = await fetch(this.makeUrl(WIREMOCK_MAPPINGS_URL + '/remove-by-metadata'), {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ [matchType]: matchObject }),
        });
        return await response.json();
    }

    protected makeUrl(endpoint: string): string {
        return new URL(endpoint, this.baseUrl).href;
    }

    private mergeWireMockFeatures(features?: IWireMockFeatures): IWireMockFeatures {
        return {
            ...this.features, // Base features as default values
            ...features, // Override with parameter values
        };
    }
}
