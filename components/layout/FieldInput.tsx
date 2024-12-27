import React, {ChangeEvent, CSSProperties, useEffect, useState} from 'react';
import styles from "@/styles/layout/FieldInput.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMicrophone} from "@fortawesome/free-solid-svg-icons";

function FieldInput({value, onChange, placeholder, style}: FieldInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isMicTouched, setIsMicTouched] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            const recognition: SpeechRecognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'de-DE';
            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let currentTranscript = ""
                // @ts-ignore
                for (const result of event.results) {
                    currentTranscript += result[0].transcript;
                }
                const simulatedEvent = {
                    target: {
                        value: currentTranscript.replace(/\D/g, ''),
                    },
                } as ChangeEvent<HTMLInputElement>;

                onChange(simulatedEvent);

            };
            recognition.onstart = () => {
                setIsRecording(true);
            };
            recognition.onend = () => {
                setIsRecording(false);
            };
            if (isRecording) {
                onChange({target: {value: ""}} as ChangeEvent<HTMLInputElement>);
                recognition.start();
            } else {
                recognition.stop();
            }
            return () => {
                recognition.stop();
            };
        }
        // eslint-disable-next-line
    }, [isRecording]);

    return (
        <div
            className={`${styles.inputContainer} ${
                (value && !isNaN(parseInt(value)) && value.length > 0) ?
                    styles.inputValid :
                    styles.inputInvalid}`}
            style={style}>
            <input value={value && !isNaN(parseInt(value.replace(/\D/g, ''))) ? parseInt(value.replace(/\D/g, '')) : ""}
                   className={styles.input}
                   type={"number"}
                   min={0}
                   max={999999}
                   step={1.0}
                   onChange={onChange}
                   placeholder={`${placeholder ? placeholder : ""}`}
                   onFocus={(event) => {
                       event.target.select()
                   }}
            />
            <div
                className={styles.microphoneContainer}
                onMouseDown={() => {
                    setIsMicTouched(true)
                    setIsRecording(true)
                }}
                onMouseUp={() => {
                    setIsMicTouched(false)
                    setIsRecording(false)
                }}
                onTouchStart={() => {
                    setIsMicTouched(true)
                    setIsRecording(true)
                }}
                onTouchEnd={() => {
                    setIsMicTouched(false)
                    setIsRecording(false)
                }}
                style={
                    {
                        background: isMicTouched ?
                            "var(--text-color)" :
                            "var(--primary-color)"
                    }
                }
            >
                <FontAwesomeIcon
                    style={
                        {
                            '--text-color': isMicTouched ?
                                "var(--primary-color)" :
                                "var(--text-color)"
                        } as React.CSSProperties
                    }
                    icon={faMicrophone}/>
            </div>
        </div>
    );
}

export type FieldInputProps = {
    value?: string
    placeholder?: string,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
    style?: CSSProperties,
}

export default FieldInput;
