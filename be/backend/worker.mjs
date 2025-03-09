import { Worker } from "bullmq";
import { createReadStream } from "fs";
import { parse } from "csv-parse";
import { supabase } from "../lib/supabase.js";

// Redis connection configuration
const redisConnection = {
  host: process.env.REDIS_HOST, // Redis host (e.g., 'localhost' or 'redis')
  port: process.env.REDIS_PORT, // Redis port (default: 6379)
};

// Create a BullMQ worker
const worker = new Worker(
  "log-processing-queue",
  async (job) => {
    const { filePath } = job.data;

    // Create a read stream for the log file
    const stream = createReadStream(filePath);

    // Parse the log file (assuming CSV format)
    stream
      .pipe(parse({ delimiter: ",", columns: true }))
      .on("data", async (row) => {
        // Extract log fields
        const { TIMESTAMP, LEVEL, MESSAGE, ...payload } = row;

        // Insert log entry into Supabase
        const { data, error } = await supabase
          .from("log-stats")
          .insert([
            { timestamp: TIMESTAMP, level: LEVEL, message: MESSAGE, payload },
          ]);

        if (error) {
          console.error("Error inserting log:", error);
        }
      })
      .on("end", () => {
        console.log("Log processing complete for:", filePath);
      })
      .on("error", (err) => {
        console.error("Error processing log file:", err);
      });
  },
  { connection: redisConnection, concurrency: 4 }
);

console.log("Worker started and listening for jobs...");
