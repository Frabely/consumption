import styles from '../styles/Login.module.css'
import de from '../constants/de.json'
import {ChangeEvent} from "react";
import {checkUserId} from "@/firebase/functions";
import {User} from "@/constants/types";
import {useDispatch} from "react-redux";
import {setCurrentUser} from "@/store/reducer/currentUser";

export default function Login({}: LoginProps) {
    const dispatch = useDispatch()
    const onInputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length === 4) {
            checkUserId(e.target.value).then((user: User | undefined) => {
                if (user) {
                    dispatch(setCurrentUser(user))
                }
            })
        }
    }
    return (
        <div className={styles.mainContainer}>
            <input onChange={onInputChangeHandler} type={"password"} className={styles.input}
                   placeholder={de.inputLabels.userID}/>
        </div>
    )
}

export type LoginProps = {}
