import { createClient } from "@supabase/supabase-js";
import cors, { runMiddleware } from "../../lib/cors"; // Import CORS

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  await runMiddleware(req, res, cors); // Apply CORS globally

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { data, error } = await supabase.from("log_stats").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
}
