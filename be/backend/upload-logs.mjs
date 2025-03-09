import express from "express";
import multer from "multer";
import { Queue } from "bullmq";
import { supabase } from "../lib/supabase.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage for uploaded files
const redisConnection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};
const queue = new Queue("log-processing-queue", {
  connection: redisConnection,
});

router.post("/upload-logs", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Upload file to Supabase Storage
  const filePath = `logs/${file.originalname}`;
  const { data, error } = await supabase.storage
    .from("logs")
    .upload(filePath, file.buffer, { contentType: file.mimetype });

  if (error) {
    // console.log(Object.keys(error));
    return res.status(500).json({ error: error.error, message: error.message });
  }

  // Add job to BullMQ queue
  const job = await queue.add("process-log", { fileId: data.id, filePath });
  return res.status(200).json({ jobId: job.id });
});

export default router;
