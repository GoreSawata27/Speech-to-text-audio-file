"use client";
import { useState } from "react";
import { AssemblyAI } from "assemblyai";

const ApiKEY = process.env.ASSEMBLYAI_API_KEY;

export default function AudioTranscriber() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const client = new AssemblyAI({
    apiKey: ApiKEY,
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("audio/")) {
      alert("Please upload a valid audio file (e.g., mp3, wav, m4a).");
      return;
    }

    setFile(selectedFile);
    setTranscript(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return alert("Please upload an audio file.");
    setLoading(true);

    try {
      const correctedFile = new Blob([file], {
        type: file.type || "audio/mp4",
      });

      const formData = new FormData();
      formData.append("file", correctedFile, file.name);

      const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          authorization: ApiKEY,
        },
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadData.upload_url) throw new Error("File upload failed.");

      console.log("File uploaded successfully:", uploadData.upload_url);

      const params = {
        audio: uploadData.upload_url,
        speaker_labels: true,
      };

      const transcript = await client.transcripts.transcribe(params);

      if (transcript.utterances) {
        setTranscript(transcript.utterances);
      } else {
        throw new Error("No transcription data available.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error during transcription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Audio and Extract Conversation</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Transcribing..." : "Upload & Transcribe"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {transcript && (
        <div>
          <h2>Conversation:</h2>
          {transcript.map((utterance, index) => (
            <p key={index}>
              <strong>Speaker {utterance.speaker}:</strong> {utterance.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
