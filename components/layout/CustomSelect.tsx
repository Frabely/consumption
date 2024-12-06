import React, {CSSProperties, useState} from 'react';
import styles from "@/styles/layout/CustomSelect.module.css";

export default function CustomSelect({
                                         onChange,
                                         defaultValue,
                                         className,
                                         options,
                                         direction = 'down',
                                         style
                                     }: CustomSelectProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultValue);

    const onToggleOptions = () => {
        setIsExpanded(!isExpanded);
    };

    const onOptionClickHandler = (index: number) => {
        const newValue = options[index];
        setSelectedValue(newValue);
        onChange(newValue);
        setIsExpanded(false);
    };

    return (
        <div
            className={`${styles.mainSelectContainer} ${className}`}
            data-direction={direction}
            style={style}
        >
            <div
                className={`${styles.selectedValue} ${isExpanded ? styles.active : ''}`}
                onClick={onToggleOptions}
            >
                {selectedValue}
            </div>
            {isExpanded && (
                <div className={`${styles.optionsContainer} ${styles[direction]}`}>
                    {options.map((option, index) => (
                        <div
                            className={styles.optionContainer}
                            key={index}
                            onClick={() => onOptionClickHandler(index)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export type CustomSelectProps = {
    onChange: (value: string) => void;
    defaultValue: string;
    className?: string;
    options: string[];
    direction?: 'down' | 'up' | 'left' | 'right';
    style?: CSSProperties
};
