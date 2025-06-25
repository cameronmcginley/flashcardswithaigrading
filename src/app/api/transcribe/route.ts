import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { logAction } from "src/lib/log";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is missing." },
        { status: 400 }
      );
    }

    // Convert webm to a format Whisper can handle
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: "audio/webm" });

    // Create a File object for Whisper
    const file = new File([audioBlob], "audio.webm", { type: "audio/webm" });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en", // Can be made configurable
      response_format: "text",
    });

    logAction({
      event: "Audio Transcription",
      tags: {
        audioSize: audioFile.size,
        textLength: transcription.length,
      },
    });

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return NextResponse.json(
      { error: `Failed to transcribe audio: ${error}` },
      { status: 500 }
    );
  }
}
