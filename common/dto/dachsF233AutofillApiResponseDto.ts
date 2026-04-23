import type {DachsAutofillBaseDto} from "@/common/dto/dachsAutofillBaseDto";

export type DachsF233AutofillApiResponseDto = DachsAutofillBaseDto & {
    bh: number;
    buderusStarts: number;
};
