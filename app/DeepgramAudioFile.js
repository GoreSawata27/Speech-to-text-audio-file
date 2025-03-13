"use client";
import { useState } from "react";

export default function DeepgramAudioFile() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTranscribe = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Transcription failed");
        return;
      }

      setTranscript(data.transcript || "No transcript available");
    } catch (error) {
      alert("Error during transcription");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Transcribe Local Audio File</h1>

      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleTranscribe} disabled={loading}>
        {loading ? "Transcribing..." : "Transcribe"}
      </button>

      {transcript && (
        <div>
          <h2>Transcript:</h2>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}
