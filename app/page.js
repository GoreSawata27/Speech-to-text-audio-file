import React from "react";
import DeepgramAudioFile from "./DeepgramAudioFile";
import AssemblyDiarization from "./AssemblyDiarization";
import AssemblyStreamAudio from "./AssemblyStreamAudio";

export default function page() {
  return (
    <div>
      <AssemblyDiarization />

      <br />
      <br />
      <AssemblyStreamAudio />

      <br />
      <br />
      <DeepgramAudioFile />
    </div>
  );
}
