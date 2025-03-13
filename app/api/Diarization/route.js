// import { NextResponse } from "next/server";
// import { AssemblyAI } from "assemblyai";
// import fs from "fs";
// import path from "path";
// import { writeFile, mkdir } from "fs/promises";

// const client = new AssemblyAI({
//   apiKey:process.env.ASSEMBLYAI_API_KEY,
// });

// // Ensure uploads directory exists
// const ensureUploadsDir = async () => {
//   const uploadPath = path.join(process.cwd(), "uploads");
//   await mkdir(uploadPath, { recursive: true });
// };

// // Save uploaded file locally
// const saveFile = async (file) => {
//   await ensureUploadsDir();
//   const fileData = await file.arrayBuffer();
//   const filePath = path.join(process.cwd(), "uploads", file.name);
//   await writeFile(filePath, Buffer.from(fileData));
//   return filePath;
// };

// // POST handler for transcription
// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     // Save the uploaded file
//     const filePath = await saveFile(file);

//     // Upload to AssemblyAI with speaker diarization enabled
//     const uploadResponse = await client.transcripts.create({
//       audio_url: `file://${filePath}`,
//       speaker_labels: true, // Enable speaker diarization
//     });

//     // Wait for transcription to complete
//     while (true) {
//       const transcript = await client.transcripts.get(uploadResponse.id);
//       if (transcript.status === "completed") {
//         fs.unlinkSync(filePath); // Clean up the uploaded file

//         // Format the output by speaker
//         const speakerText = transcript.utterances.map((utterance) => ({
//           speaker: `Speaker ${utterance.speaker + 1}`,
//           text: utterance.text,
//         }));

//         return NextResponse.json({ transcript: speakerText });
//       } else if (transcript.status === "failed") {
//         fs.unlinkSync(filePath);
//         return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
//       }
//       await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before retrying
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";
import fs from "fs";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadPath = path.join(process.cwd(), "uploads");
  await mkdir(uploadPath, { recursive: true });
};

// Save uploaded file locally
const saveFile = async (file) => {
  await ensureUploadsDir();
  const fileData = await file.arrayBuffer();
  const filePath = path.join(process.cwd(), "uploads", file.name);
  await writeFile(filePath, Buffer.from(fileData));
  return filePath;
};

// POST handler for transcription
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save the uploaded file
    const filePath = await saveFile(file);

    // Upload to AssemblyAI with auto language detection and speaker diarization
    const uploadResponse = await client.transcripts.create({
      audio_url: `file://${filePath}`,
      language_detection: true, // Enable multi-language support
      speaker_labels: true, // Enable speaker diarization
    });

    // Wait for transcription to complete
    while (true) {
      const transcript = await client.transcripts.get(uploadResponse.id);
      if (transcript.status === "completed") {
        fs.unlinkSync(filePath); // Clean up the uploaded file

        // Format transcript by speaker
        const speakerText = transcript.utterances.map((utterance) => ({
          speaker: `Speaker ${utterance.speaker + 1}`,
          text: utterance.text,
          language: transcript.language_code, // Include detected language
        }));

        return NextResponse.json({ transcript: speakerText });
      } else if (transcript.status === "failed") {
        fs.unlinkSync(filePath);
        return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
      }
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before retrying
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
