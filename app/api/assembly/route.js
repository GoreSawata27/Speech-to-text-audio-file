import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { writeFile, mkdir } from "fs/promises";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadPath = path.join(process.cwd(), "uploads");
  try {
    await mkdir(uploadPath, { recursive: true });
  } catch (error) {
    console.error("Error creating uploads directory:", error);
  }
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

    // Save the file
    const filePath = await saveFile(file);

    // Upload to AssemblyAI
    const uploadResponse = await client.transcripts.create({
      audio_url: `file://${filePath}`,
    });

    // Wait for transcription to complete
    while (true) {
      const transcript = await client.transcripts.get(uploadResponse.id);
      if (transcript.status === "completed") {
        fs.unlinkSync(filePath); // Clean up the local file
        return NextResponse.json({ transcript: transcript.text });
      } else if (transcript.status === "failed") {
        fs.unlinkSync(filePath);
        return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
