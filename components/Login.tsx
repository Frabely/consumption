import styles from '../styles/Login.module.css'
import de from '../constants/de.json'
import {ChangeEvent} from "react";
import {checkUserId} from "@/firebase/functions";
import {User} from "@/constants/types";
import {setCurrentUser} from "@/store/reducer/currentUser";
import {cars} from "@/constants/constantData";
import {CarNames} from "@/constants/enums";
import {setCurrentCar} from "@/store/reducer/currentCar";
import {useAppDispatch} from "@/store/hooks";

export default function Login({}: LoginProps) {
    const dispatch = useAppDispatch()

    const onInputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length === 4) {
            checkUserId(e.target.value).then((user: User | undefined) => {
                if (user) {
                    const car = cars.find(car =>
                        car.name === user.defaultCar ||
                        car.name === CarNames.Zoe);
                    if (car) {
                        dispatch(setCurrentCar(car));
                    }
                    dispatch(setCurrentUser(user))
                }
            })
        }
    }

    return (
        <form className={styles.mainContainer}>
            <input onChange={onInputChangeHandler}
                   type={"password"}
                   className={styles.input}
                   placeholder={de.inputLabels.userID}
            />
        </form>
    )
}

export type LoginProps = {}
