"use client";
import { useState } from "react";

export default function AssemblyDiarization() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState([]);
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
      const response = await fetch("/api/Diarization", {
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
    <div className="border">
      <h1>AssemblyAI : Upload Audio for Speaker Diarization</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept="audio/*" />
        <button className="ml-6" type="submit" disabled={loading}>
          {loading ? "Transcribing..." : "Upload and Transcribe"}
        </button>
      </form>

      {transcript.length > 0 && (
        <div>
          <h2>Transcription:</h2>
          {transcript.map((item, index) => (
            <p key={index}>
              <strong>{item.speaker}: </strong>
              {item.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
