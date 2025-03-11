import multer from "multer";
import path from "path";
import { Queue } from "bullmq";
import Redis from "ioredis";
import cors, { runMiddleware } from "../../lib/cors"; // Import CORS
import rateLimit from "express-rate-limit";

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

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 7, // Limit each IP to 10 requests per windowMs
  message: "Too many requests, please try again later.",
});

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await runMiddleware(req, res, limiter);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ error: "File upload failed" });
    }

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
      res.status(500).json({ error: "Failed to enqueue job" });
    }
  });
}
