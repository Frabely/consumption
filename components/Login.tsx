import styles from '../styles/Login.module.css'
import de from '../constants/de.json'
import {ChangeEvent, useState} from "react";
import {checkUserId} from "@/firebase/functions";
import {User} from "@/constants/types";
import {setCurrentUser} from "@/store/reducer/currentUser";
import {cars} from "@/constants/constantData";
import {CarNames} from "@/constants/enums";
import {setCurrentCar} from "@/store/reducer/currentCar";
import {useAppDispatch} from "@/store/hooks";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";

export default function Login({}: LoginProps) {
    const dispatch = useAppDispatch()
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)

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
        <section className={styles.mainContainer}>
            <form
                className={styles.loginCard}
                onSubmit={(event) => {
                    event.preventDefault()
                }}
            >
                <div className={styles.inputWrapper}>
                    <input
                        onChange={onInputChangeHandler}
                        type={isPasswordVisible ? "text" : "password"}
                        className={styles.input}
                        placeholder={de.inputLabels.userID}
                        maxLength={4}
                        autoComplete={"off"}
                        autoCapitalize={"off"}
                        spellCheck={false}
                    />
                    <button
                        type={"button"}
                        className={styles.visibilityButton}
                        aria-label={isPasswordVisible ? "Passwort verbergen" : "Passwort anzeigen"}
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye}/>
                    </button>
                </div>
            </form>
        </section>
    )
}

export type LoginProps = {}
