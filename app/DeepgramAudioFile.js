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
    <div className="max-w-2xl p-8 mx-auto my-12 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-900 dark:text-white">
        🎤 Deepgram: Transcribe Local Audio File
      </h1>

      <div className="flex flex-col items-center gap-6">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
        />

        <button
          onClick={handleTranscribe}
          disabled={loading}
          className={`px-6 py-3 rounded-lg text-white font-semibold transition-all ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Transcribing..." : "Transcribe"}
        </button>
      </div>

      {transcript && (
        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">📝 Transcript:</h2>
          <p className="p-4 text-gray-800 bg-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:text-gray-300">
            {transcript}
          </p>
        </div>
      )}
    </div>
  );
}
