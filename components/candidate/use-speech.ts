"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// Browser speech APIs stand in for the real AI voice service in this POC.

const subscribe = () => () => {};

/** Reads text aloud with the browser's speech synthesis. */
export function useSpeechSynthesis() {
  const supported = useSyncExternalStore(
    subscribe,
    () => "speechSynthesis" in window,
    () => false
  );
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!supported) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setSpeaking(false);
        onEnd?.();
      };
      window.speechSynthesis.speak(utterance);
    },
    [supported]
  );

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  useEffect(() => cancel, [cancel]);

  return { supported, speaking, speak, cancel };
}

type RecognitionResultList = {
  length: number;
  [index: number]: { isFinal: boolean; 0: { transcript: string } };
};

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: RecognitionResultList }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type RecognitionConstructor = new () => Recognition;

function getRecognitionConstructor(): RecognitionConstructor | undefined {
  const speechWindow = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

/** Live speech-to-text for the candidate's answers (Chrome / Edge). */
export function useSpeechRecognition() {
  const supported = useSyncExternalStore(
    subscribe,
    () => getRecognitionConstructor() !== undefined,
    () => false
  );
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");

  const recognitionRef = useRef<Recognition | null>(null);

  const start = useCallback(() => {
    const Constructor = getRecognitionConstructor();
    if (!Constructor) return;

    recognitionRef.current?.abort();
    setFinalText("");
    setInterimText("");

    const recognition = new Constructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      if (final) setFinalText((current) => `${current} ${final}`.trim());
      setInterimText(interim);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
    setInterimText("");
  }, []);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return {
    supported,
    listening,
    transcript: `${finalText} ${interimText}`.trim(),
    start,
    stop,
  };
}
