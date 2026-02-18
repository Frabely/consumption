import {cars} from "@/constants/constantData";
import {CarNames} from "@/constants/enums";
import {Car, User} from "@/constants/types";
import {checkUserId} from "@/firebase/functions";
import {setCurrentCar} from "@/store/reducer/currentCar";
import {setCurrentUser} from "@/store/reducer/currentUser";

export type LoginDispatchAction =
    | ReturnType<typeof setCurrentCar>
    | ReturnType<typeof setCurrentUser>;

export type LoginDispatch = (action: LoginDispatchAction) => void;

export type CheckUserIdFn = (id: string) => Promise<User | undefined>;

export type HandleLoginInputParams = {
    input: string;
    dispatch: LoginDispatch;
    checkUserIdFn?: CheckUserIdFn;
};

export const isCompleteLoginInput = (input: string): boolean => input.length === 4;

export const resolveLoginCar = (
    user: User,
    availableCars: Car[] = cars
): Car | undefined =>
    availableCars.find((car) => car.name === user.defaultCar || car.name === CarNames.Zoe);

export const handleLoginInput = async ({
    input,
    dispatch,
    checkUserIdFn = checkUserId
}: HandleLoginInputParams): Promise<void> => {
    if (!isCompleteLoginInput(input)) {
        return;
    }

    const user = await checkUserIdFn(input);
    if (!user) {
        return;
    }

    const car = resolveLoginCar(user);
    if (car) {
        dispatch(setCurrentCar(car));
    }

    dispatch(setCurrentUser(user));
};
