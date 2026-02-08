import React, {ChangeEvent, CSSProperties, useEffect, useState} from 'react';
import styles from "@/styles/layout/FieldInput.module.css";
import {CSSVariables, FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMicrophone} from "@fortawesome/free-solid-svg-icons";

function FieldInput({value, onChange, placeholder}: FieldInputProps) {
    const [isFocus, setIsFocus] = useState(false)
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
                let currentTranscript = value ? value : ""
                // @ts-ignore
                for (const result of event.results) {
                    currentTranscript += result[0].transcript;
                }
                const simulatedEvent = {
                    target: {
                        value: currentTranscript.replace(/[^\d-]/g, ''),
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
                recognition.start();
            } else {
                recognition.stop();
            }
            return () => {
                recognition.stop();
            };
        }
    }, [isRecording]);



    return (
        <div
            className={`${styles.inputContainer} ${
                (value && !isNaN(parseInt(value)) && value.length > 0) ?
                    styles.inputValid :
                    styles.inputInvalid}`}
            style={isFocus ? {borderStyle: "solid", borderWidth: "3px", borderColor: "black"} : {}}>
            <input value={value && !isNaN(parseInt(value.replace(/[^\d-]/g, ''))) ? parseInt(value.replace(/[^\d-]/g, '')) : ""}
                   className={styles.input}
                   type={"number"}
                   min={-999999}
                   max={999999}
                   step={1.0}
                   onChange={onChange}
                   placeholder={`${placeholder ? placeholder : ""}`}
                   onFocus={(event) => {
                       setIsFocus(true)
                       event.target.select()
                   }}
                   onBlur={() => setIsFocus(false)}
            />
            <div
                className={styles.microphoneContainer}
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
                        } as CSSProperties & CSSVariables
                    }
                    icon={faMicrophone}/>
            </div>
        </div>
    );
}

export type FieldInputProps = {
    value?: string
    placeholder?: string,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export default FieldInput;
