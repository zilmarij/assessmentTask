import { Queue } from "bullmq";
import Redis from "ioredis";
import cors, { runMiddleware } from "../../lib/cors"; // Import CORS

const redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const logQueue = new Queue("log-processing-queue", { connection: redis });

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const waiting = await logQueue.getWaitingCount();
  const active = await logQueue.getActiveCount();
  const completed = await logQueue.getCompletedCount();
  const failed = await logQueue.getFailedCount();

  res.status(200).json({ waiting, active, completed, failed });
}
