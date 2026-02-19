import React, {CSSProperties} from 'react';
import styles from "./CustomButton.module.css";

export default function CustomButton({onClick, disabled, style, label}: CustomButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={styles.button}
            style={style}
        >{label}</button>
    );
}

export type CustomButtonProps = {
    onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined,
    disabled?: boolean,
    style?: CSSProperties,
    label?: string
}
