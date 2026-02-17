import React, { CSSProperties, useState } from 'react';
import styles from "@/styles/layout/CustomSelect.module.css";

export default function CustomSelect({
                                         onChange,
                                         defaultValue,
                                         className,
                                         options,
                                         keys,
                                         direction = 'down',
                                         style,
                                         styleOptions
                                     }: CustomSelectProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultValue);

    const onToggleOptions = () => {
        setIsExpanded(!isExpanded);
    };

    const onOptionClickHandler = (index: number) => {
        const newValue = options[index];
        const associatedKey = keys ? keys[index] : undefined;

        setSelectedValue(newValue);
        onChange(newValue, associatedKey);
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
                <div className={`${styles.optionsContainer} ${styles[direction]}`} style={styleOptions}>
                    {options.map((option, index) => (
                        <div
                            className={styles.optionContainer}
                            key={keys ? keys[index] : index}
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
    onChange: (value: string, key?: string) => void;
    defaultValue: string;
    className?: string;
    options: string[];
    keys?: string[];
    direction?: 'down' | 'up' | 'left' | 'right';
    style?: CSSProperties;
    styleOptions?: CSSProperties;
};
