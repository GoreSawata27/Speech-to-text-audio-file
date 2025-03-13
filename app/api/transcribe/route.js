import { NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";
import { writeFile } from "fs/promises";
import { createReadStream } from "fs";
import os from "os";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      return NextResponse.json({ error: "Missing Deepgram API key" }, { status: 500 });
    }

    // Get the system's temporary directory (cross-platform)
    const tempDir = os.tmpdir();

    // Save the uploaded file temporarily
    const tempFilePath = path.join(tempDir, file.name);
    await writeFile(tempFilePath, Buffer.from(await file.arrayBuffer()));

    // Initialize Deepgram client
    const deepgram = createClient(deepgramApiKey);

    // Send file to Deepgram for transcription
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      createReadStream(tempFilePath),
      { smart_format: true, model: "nova-2", language: "en-US" }
    );

    if (error) {
      console.error("Deepgram error:", error);
      return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
    }

    // Return transcript
    return NextResponse.json({ transcript: result?.results?.channels[0]?.alternatives[0]?.transcript });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
