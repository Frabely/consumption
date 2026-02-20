import type {Field} from "@/common/models/field";

export type FieldValue = {
    field: Field;
    day?: Date;
    value: string | null;
};


