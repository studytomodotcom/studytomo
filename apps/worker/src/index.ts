/**
 * StudyTomo Worker Service
 * ------------------------------------------------------
 * Express 5 API to handle YouTube transcription jobs.
 * 1. Receive YouTube URL
 * 2. Download audio via yt-dlp
 * 3. Convert to WAV via ffmpeg
 * 4. Send to OpenAI Whisper
 * 5. Return transcript JSON
 */

import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const YT_DLP_PATH = process.env.YT_DLP_PATH || "yt-dlp";
const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
const TEMP_DIR = path.resolve("temp");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

/** Run a shell command and return a promise */
function runCommand(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`💻 Running: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Command failed:", stderr || stdout);
        reject(stderr || stdout);
      } else resolve();
    });
  });
}

/** POST /transcribe — Body: { youtubeUrl: string } */
app.post("/transcribe", async (req, res) => {
  const { youtubeUrl } = req.body;
  if (!youtubeUrl) return res.status(400).json({ error: "Missing youtubeUrl" });

  const id = Date.now().toString();
  const audioPath = path.join(TEMP_DIR, `${id}.mp3`);
  const wavPath = path.join(TEMP_DIR, `${id}.wav`);

  console.log(`\n▶️ Received: ${youtubeUrl}`);

  try {
    // Step 1 — Download YouTube audio
    console.log("⬇️ Downloading audio...");
    await runCommand(`"${YT_DLP_PATH}" -x --audio-format mp3 -o "${audioPath}" "${youtubeUrl}"`);

    // Step 2 — Convert to WAV
    console.log("🎧 Converting to WAV...");
    await runCommand(`"${FFMPEG_PATH}" -y -i "${audioPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${wavPath}"`);

    // Step 3 — Verify file
    const wavStats = fs.statSync(wavPath);
    if (wavStats.size < 50000) throw new Error("Converted WAV too small — possible conversion failure");

    // Step 4 — Send to OpenAI Whisper
    console.log("🧠 Sending to OpenAI Whisper...");

    // ✅ Proper File wrapper for Node.js streams
    const file = new File([fs.readFileSync(wavPath)], "audio.wav");

    const resp = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "text",
    });

    console.log("✅ Transcription complete");
    res.json({ transcript: resp });

    // Cleanup
    fs.unlinkSync(audioPath);
    fs.unlinkSync(wavPath);
  } catch (err: any) {
    console.error("❌ Worker error:", err);
    res.status(500).json({ error: err.toString() });

    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 StudyTomo Worker running on port ${PORT}`);
});
