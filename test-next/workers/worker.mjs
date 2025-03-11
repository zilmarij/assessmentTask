import { Worker } from "bullmq";
import Redis from "ioredis";
import fs from "fs";
import readline from "readline";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
console.log("Waiting for jobs to be processed...");

const worker = new Worker(
  "log-processing-queue",
  async (job) => {
    console.log(`Processing job: ${job.id}`);

    const { filename, filePath } = job.data;
    try {
      const fileStream = fs.createReadStream(filePath);
      const rl = readline.createInterface({ input: fileStream });

      let errorCount = 0;
      let keywordHits = {};
      let ipAddresses = new Set();

      // Configurable keywords (from .env)
      const keywords = process.env.KEYWORDS
        ? process.env.KEYWORDS.split(",")
        : [];
      console.log(keywords);

      for await (const line of rl) {
        keywords.forEach((keyword) => {
          if (line.toLowerCase().includes(keyword.toLowerCase())) {
            keywordHits[keyword] = (keywordHits[keyword] || 0) + 1;
          }
        });

        //error Count
        if (
          line.toLowerCase().includes("error") ||
          /\b(error|failed|exception)\b/i.test(line)
        ) {
          errorCount++;
        }

        // unique IP address count
        const ipMatch = line.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
        if (ipMatch) ipAddresses.add(ipMatch[0]);
      }

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
    } catch (err) {
      //try-catch to handle stream errors and job failures gracefully
      console.error(`Job ${job.id} failed:`, err.message);
      throw err;
    }
  },
  { connection: redis, concurrency: 4, removeOnFail: false, attempts: 3 }
);
