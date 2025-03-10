import { Worker } from "bullmq";
import Redis from "ioredis";
import fs from "fs";
import readline from "readline";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Redis and Supabase
const redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Create the BullMQ Worker
const worker = new Worker(
  "log-processing-queue",
  async (job) => {
    console.log(`Processing job: ${job.id}`);

    const { filename, filePath } = job.data;

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream });

    let errorCount = 0;
    let keywordHits = {};
    let ipAddresses = new Set();

    // Configurable keywords (from .env)
    const keywords = process.env.KEYWORDS
      ? process.env.KEYWORDS.split(",")
      : [];

    for await (const line of rl) {
      const match = line.match(/\[(.*?)\] (\w+) (.*?)({.*})?/);
      if (!match) continue;

      const [, timestamp, level, message, jsonPayload] = match;
      if (level === "ERROR") errorCount++;

      if (jsonPayload) {
        try {
          const parsedData = JSON.parse(jsonPayload);
          if (parsedData.ip) ipAddresses.add(parsedData.ip);
        } catch (e) {
          console.warn("Invalid JSON in log:", jsonPayload);
        }
      }

      // Check for keyword matches
      keywords.forEach((keyword) => {
        if (message.includes(keyword)) {
          keywordHits[keyword] = (keywordHits[keyword] || 0) + 1;
        }
      });
    }

    // Store results in Supabase
    const { error } = await supabase.from("log_stats").insert({
      filename: filename,
      errors: errorCount,
      unique_ips: Array.from(ipAddresses),
      keyword_counts: keywordHits,
    });

    if (error) {
      console.error("Supabase insert error:", error.message);
      throw new Error(error.message);
    }

    console.log(`Job ${job.id} completed successfully`);
  },
  { connection: redis, concurrency: 4 }
);

// Handle worker errors
worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});
