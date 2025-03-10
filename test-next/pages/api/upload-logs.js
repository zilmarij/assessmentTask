import multer from "multer";
import path from "path";
import { Queue } from "bullmq";
import Redis from "ioredis";
import fs from "fs";

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const logQueue = new Queue("log-processing-queue", { connection: redis });

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file
  },
});
const upload = multer({ storage });

// Disable Next.js default body parser
export const config = {
  api: { bodyParser: false },
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ error: "File upload failed" });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, filename, path: filePath } = req.file;

    try {
      // Add job to BullMQ queue
      const job = await logQueue.add("process-log", {
        originalname,
        filename,
        filePath,
      });

      res.status(200).json({
        jobId: job.id,
        message: "File uploaded and job enqueued",
      });
    } catch (error) {
      console.error("Queue error:", error);
      res.status(500).json({ error: "Failed to enqueue job" });
    }
  });
}
