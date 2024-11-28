import React, {ChangeEvent, useEffect, useState} from 'react';
import styles from "@/styles/layout/FieldInput.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMicrophone} from "@fortawesome/free-solid-svg-icons";

function FieldInput({}: FieldInputProps) {
    const [isFocus, setIsFocus] = useState(false)
    const [isRecording, setIsRecording] = useState(false);
    const [isMicTouched, setIsMicTouched] = useState(false)
    const [micValue, setMicValue] = useState<string>("")

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            const recognition: SpeechRecognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'de-DE';
            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let currentTranscript = micValue;
                // @ts-ignore
                for (const result of event.results) {
                    currentTranscript += result[0].transcript;
                }
                setMicValue(currentTranscript.replace(/\D/g, ''));
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
                (micValue.length > 0) ? 
                    styles.inputValid : 
                    styles.inputInvalid}`}
            style={isFocus ? {borderStyle: "solid", borderWidth: "3px", borderColor: "black"} : {}}>
            <input value={!isNaN(parseInt(micValue.replace(/\D/g, ''))) ? parseInt(micValue.replace(/\D/g, '')) : ""}
                   className={styles.input}
                   type={"number"}
                   min={0}
                   max={999999}
                   step={1.0}
                   onChange={(event: ChangeEvent<HTMLInputElement>) => {
                       setMicValue(event.target.value.replace(/\D/g, ''))
                   }}
                   placeholder={`Wert`}
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
                style={{background: isMicTouched ? "black" : "white"}}
            >
                <FontAwesomeIcon
                    style={{'--color-text': isMicTouched ? "white" : "black" } as React.CSSProperties}
                    icon={faMicrophone}/>
            </div>
        </div>
    );
}

export type FieldInputProps = {
}

export default FieldInput;
