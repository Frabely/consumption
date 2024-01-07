'use client'

import {useEffect, useState} from "react";

export default function SpeechToTextDemo() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            const recognition: SpeechRecognition = new SpeechRecognition();

            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'de-DE'; // Setzen Sie hier Ihre bevorzugte Sprache

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let currentTranscript = '';
                // @ts-ignore
                for (const result of event.results) {
                    currentTranscript += result[0].transcript;
                }
                setTranscript(currentTranscript);
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
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: '100%'}}>

            <button onClick={() => setIsRecording(!isRecording)}>
                {isRecording ? 'Stop Aufnahme' : 'Start Aufnahme'}
            </button>
            <textarea value={transcript} readOnly/>
        </div>
    )
}
