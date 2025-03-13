"use client";
import { useState } from "react";

export default function DeepgramAudioUrl() {
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranscribe = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        setTranscript(data.transcript);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error transcribing audio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter audio URL"
        value={audioUrl}
        onChange={(e) => setAudioUrl(e.target.value)}
      />
      <button onClick={handleTranscribe} disabled={loading}>
        {loading ? "Transcribing..." : "Transcribe"}
      </button>
      {transcript && <p>Transcript: {transcript}</p>}
    </div>
  );
}
