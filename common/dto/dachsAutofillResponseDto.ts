import type {DachsF233AutofillApiResponseDto} from "@/common/dto/dachsF233AutofillApiResponseDto";
import type {DachsF235AutofillApiResponseDto} from "@/common/dto/dachsF235AutofillApiResponseDto";

export type DachsAutofillResponseDtoByHouse = {
    F233: DachsF233AutofillApiResponseDto;
    F235: DachsF235AutofillApiResponseDto;
};

export type DachsAutofillResponseDto = DachsAutofillResponseDtoByHouse[keyof DachsAutofillResponseDtoByHouse];
