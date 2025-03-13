"use client";
import { useState, useEffect } from "react";

const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event) => {
          const currentTranscript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("");
          setTranscript(currentTranscript);
        };

        recognitionInstance.onend = () => {
          if (isListening) recognitionInstance.start(); // Auto restart if listening
        };

        setRecognition(recognitionInstance);
      } else {
        console.error("Speech recognition not supported in this browser.");
      }
    }
  }, [isListening]);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div>
      <h1>Speech to Text</h1>
      <button className="to-yellow-300 " onClick={isListening ? stopListening : startListening}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>
      <p>{transcript}</p>
    </div>
  );
};

export default SpeechToText;
