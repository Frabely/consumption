import React, {CSSProperties, KeyboardEvent, useEffect, useRef, useState} from "react";
import styles from "./CustomSelect.module.css";

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
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedValue(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        const onDocumentClickHandler = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        document.addEventListener("mousedown", onDocumentClickHandler);
        return () => {
            document.removeEventListener("mousedown", onDocumentClickHandler);
        };
    }, []);

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

    const onSelectKeyDownHandler = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggleOptions();
        }
        if (event.key === "Escape") {
            setIsExpanded(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.mainSelectContainer} ${className}`}
            data-direction={direction}
            style={style}
        >
            <div
                className={`${styles.selectedValue} ${isExpanded ? styles.active : ''}`}
                onClick={onToggleOptions}
                onKeyDown={onSelectKeyDownHandler}
                role={"button"}
                tabIndex={0}
                aria-expanded={isExpanded}
            >
                <span className={styles.selectedText}>{selectedValue}</span>
                <span className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ""}`}>⌄</span>
            </div>
            {isExpanded && (
                <div className={`${styles.optionsContainer} ${styles[direction]}`} style={styleOptions}>
                    {options.map((option, index) => (
                        <div
                            className={`${styles.optionContainer} ${selectedValue === option ? styles.optionSelected : ""}`}
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
