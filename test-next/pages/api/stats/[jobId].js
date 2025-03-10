import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { jobId } = req.query;

  const { data, error } = await supabase
    .from("log_stats")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) {
    return res.status(404).json({ error: "Log not found" });
  }

  res.status(200).json(data);
}
