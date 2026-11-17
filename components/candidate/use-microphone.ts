"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MicStatus = "idle" | "requesting" | "granted" | "denied" | "unsupported";

/**
 * Requests microphone access and reports a live input level (0–1).
 * The stream is released when the component unmounts.
 */
export function useMicrophone() {
  const [status, setStatus] = useState<MicStatus>("idle");
  const [level, setLevel] = useState(0);
  const [muted, setMuted] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      audioContext.createMediaStreamSource(stream).connect(analyser);

      const samples = new Uint8Array(analyser.fftSize);

      const tick = () => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) {
          const normalized = (sample - 128) / 128;
          sum += normalized * normalized;
        }
        // Scale RMS so normal speech fills most of the meter.
        setLevel(Math.min(1, Math.sqrt(sum / samples.length) * 4));
        frameRef.current = requestAnimationFrame(tick);
      };
      tick();

      setStatus("granted");
    } catch {
      setStatus("denied");
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      streamRef.current
        ?.getAudioTracks()
        .forEach((track) => (track.enabled = current));
      return !current;
    });
  }, []);

  useEffect(() => stop, [stop]);

  return { status, level: muted ? 0 : level, muted, start, toggleMute };
}
