"use client";
import { useState } from "react";

export default function AssemblyStreamAudio() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload a file");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/assembly", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setTranscript(data.transcript);
      } else {
        alert(data.error || "Transcription failed");
      }
    } catch (error) {
      alert("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Audio for Transcription</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept="audio/*" />
        <button type="submit" disabled={loading}>
          {loading ? "Transcribing..." : "Upload and Transcribe"}
        </button>
      </form>

      {transcript && (
        <div>
          <h2>Transcription:</h2>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}
