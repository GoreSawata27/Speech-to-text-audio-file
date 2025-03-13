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
    <div className="max-w-3xl p-8 mx-auto my-12 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-900 dark:text-white">
        🎵 AssemblyAI: Upload Audio for Speaker Diarization ( Multi language ) ( works in local currently)
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        <input
          type="file"
          onChange={handleFileChange}
          accept="audio/*"
          className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
        />

        <button
          type="submit"
          className={`px-6 py-3 rounded-lg text-white font-semibold transition-all ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
          disabled={loading}
        >
          {loading ? "Transcribing..." : "Upload and Transcribe"}
        </button>
      </form>

      {transcript.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">📝 Transcription:</h2>
          <div className="space-y-4">
            {transcript.map((item, index) => (
              <p key={index} className="p-4 bg-gray-100 rounded-lg shadow-sm dark:bg-gray-700">
                <strong className="text-blue-600 dark:text-blue-400">{item.speaker}: </strong>
                <span className="text-gray-800 dark:text-gray-300">{item.text}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
