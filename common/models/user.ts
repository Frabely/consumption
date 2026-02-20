import {Role} from "@/constants/enums";

export type User = {
    name?: string;
    key?: string;
    role?: Role;
    defaultCar?: string;
};


