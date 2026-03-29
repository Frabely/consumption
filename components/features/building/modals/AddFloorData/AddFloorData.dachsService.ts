import {API_BASE_URL} from "@/constants/api";

export type DachsAutofillApiResponse = {
    bh?: number;
    starts?: number;
    electricityInternal?: number;
    heat?: number;
    maintenance?: number;
    buderusBh?: number;
    buderusStarts?: number;
};

export type DachsAutofillValues = {
    bh?: number;
    starts?: number;
    electricityInternal?: number;
    heat?: number;
    maintenance?: number;
    buderusBh?: number;
    buderusStarts?: number;
};

const DACHS_STATUS_ENDPOINT_PATH = "/dachs/status";

/**
 * Resolves the fully qualified Dachs status endpoint.
 * @returns Fully qualified endpoint URL for the Dachs status request.
 */
export const resolveDachsStatusEndpoint = (): string =>
    `${API_BASE_URL}${DACHS_STATUS_ENDPOINT_PATH}`;

/**
 * Fetches the raw Dachs status payload from the upstream API.
 * @param signal Optional abort signal for request cancellation.
 * @returns Raw Dachs API response payload.
 */
export const getDachsAutofillApiResponse = async (
    signal?: AbortSignal
): Promise<DachsAutofillApiResponse> => {
    const response = await fetch(resolveDachsStatusEndpoint(), {cache: "no-store", signal});
    if (!response.ok) {
        throw new Error(`Dachs status request failed with status ${response.status}`);
    }

    return await response.json() as DachsAutofillApiResponse;
};

/**
 * Loads Dachs meter values and normalizes them to internal field keys.
 * @param signal Optional abort signal for request cancellation.
 * @returns Normalized Dachs values that can be mapped onto room fields.
 */
export const getDachsAutofillValues = async (signal?: AbortSignal): Promise<DachsAutofillValues> => {
    const response = await getDachsAutofillApiResponse(signal);

    return {
        bh: response.bh,
        starts: response.starts,
        electricityInternal: response.electricityInternal,
        heat: response.heat,
        maintenance: response.maintenance,
        buderusBh: response.buderusBh,
        buderusStarts: response.buderusStarts
    };
};
