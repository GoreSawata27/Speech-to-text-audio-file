"use client";
import { useState } from "react";
import axios from "axios";

export default function AudioTranscriber() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setTranscript("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return alert("Please upload an audio file.");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await axios.post("https://api.assemblyai.com/v2/upload", formData, {
        headers: {
          authorization: "",
          "Content-Type": "multipart/form-data",
        },
      });

      const audioUrl = uploadResponse.data.upload_url;

      const transcriptResponse = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        { audio_url: audioUrl },
        {
          headers: { authorization: "" },
        }
      );

      const transcriptId = transcriptResponse.data.id;

      const checkStatus = async () => {
        try {
          const { data } = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
            headers: { authorization: "" },
          });

          if (data.status === "completed") {
            setTranscript(data.text);
            setLoading(false);
          } else if (data.status === "failed") {
            setError("Transcription failed. Try again.");
            setLoading(false);
          } else {
            setTimeout(checkStatus, 5000);
          }
        } catch (err) {
          setError("Error checking status.");
          setLoading(false);
        }
      };

      checkStatus();
    } catch (err) {
      setError("Error during upload.");
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Audio and Transcribe</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Transcribing..." : "Upload & Transcribe"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {transcript && (
        <div>
          <h2>Transcript:</h2>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}
