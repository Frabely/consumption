import type {DachsAutofillResponseDtoByHouse} from "@/common/dto";
import {DACHS_HOUSE_CONFIG, DachsHouseName} from "@/common/dachs/dachsHouseConfig";
import {API_BASE_URL} from "@/constants/api";

/**
 * Resolves the Dachs status endpoint for a supported house name.
 * @param houseName Supported Dachs house name.
 * @returns Fully qualified endpoint URL for the selected Dachs status request.
 */
const resolveDachsStatusEndpoint = (houseName: DachsHouseName): string =>
    `${API_BASE_URL}${DACHS_HOUSE_CONFIG[houseName].endpointPath}`;

/**
 * Fetches the raw Dachs status payload from the upstream API.
 * @param endpoint Fully qualified endpoint URL for the Dachs status request.
 * @param signal Optional abort signal for request cancellation.
 * @returns Raw Dachs API response payload.
 */
const fetchDachsStatusApiResponse = async <TResponseDto>(
    endpoint: string,
    signal?: AbortSignal
): Promise<TResponseDto> => {
    const response = await fetch(endpoint, {cache: "no-store", signal});
    if (!response.ok) {
        throw new Error(`Dachs status request failed with status ${response.status}`);
    }

    return await response.json() as TResponseDto;
};

/**
 * Loads the Dachs API response for a supported house name.
 * @param houseName Supported Dachs house name.
 * @param signal Optional abort signal for request cancellation.
 * @returns Dachs API response DTO for the selected house.
 */
export async function getDachsAutofillValues<THouse extends DachsHouseName>(
    houseName: THouse,
    signal?: AbortSignal
): Promise<DachsAutofillResponseDtoByHouse[THouse]> {
    return await fetchDachsStatusApiResponse<DachsAutofillResponseDtoByHouse[THouse]>(
        resolveDachsStatusEndpoint(houseName),
        signal
    );
}
