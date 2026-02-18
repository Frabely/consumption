import styles from './Login.module.css'
import de from '../../constants/de.json'
import {ChangeEvent, useState} from "react";
import {useAppDispatch} from "@/store/hooks";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import {handleLoginInput} from "@/domain/login";

export default function Login({}: LoginProps) {
    const dispatch = useAppDispatch()
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)

    const onInputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        void handleLoginInput({input: e.target.value, dispatch});
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
