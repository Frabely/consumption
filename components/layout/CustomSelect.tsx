import React, {useState} from 'react';
import styles from "@/styles/layout/CustomSelect.module.css";

export default function CustomSelect({onChange, defaultValue, classname, options}: CustomSelectProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedValue, setSelectedValue] = useState(defaultValue)
    const onOpenOptionsClickHandler = () => {
        setIsExpanded(!isExpanded)
    }

    const onOptionClickHandler = (index: number) => {
        setSelectedValue(options[index])
    }

    return (
        <div className={`${styles.mainSelectContainer} ${classname}`}>
            <div onClick={onOpenOptionsClickHandler}>{selectedValue}</div>
            {isExpanded ?
                <div className={styles.optionsContainer}>
                    {options.map((option, index) =>
                    <div
                        className={styles.optionContainer}
                        key={index}
                        onClick={() => {onOptionClickHandler(index)}}
                    >
                        {option}
                    </div>)}
                </div> :
                null
            }
        </div>
    );
}

export type CustomSelectProps = {
    onChange: any,
    defaultValue: string,
    classname: string,
    options: string[],
}
