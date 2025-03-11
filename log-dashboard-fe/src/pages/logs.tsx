import { useEffect, useState } from "react";
import useSWR from "swr";
import { api } from "@/api/axios";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function LogsDashboard() {
  const { data, error, mutate } = useSWR(
    "http://localhost:3002/api/stats",
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [jobProgress, setJobProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    if (ws) return;
    const connectWebSocket = () => {
      ws = new WebSocket("ws://localhost:4000");

      ws.onopen = () => console.log("✅ Connected to WebSocket server");

      ws.onmessage = (event) => {
        const update = JSON.parse(event.data);
        console.log("🔥 Received real-time update:");

        if (update.status === "processing") {
          setJobProgress((prev) => ({
            ...prev,
            [update.jobId]: update.progress,
          }));
        } else if (update.status === "completed") {
          setLiveFeed((prevFeed) => [update, ...prevFeed]);
          mutate();
        }
      };

      ws.onerror = (error) => console.error("🚨 WebSocket Error:", error);

      ws.onclose = () => {
        console.warn(
          "❌ WebSocket disconnected. Reconnecting in .1 seconds..."
        );
        reconnectTimeout = setTimeout(connectWebSocket, 100);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [mutate]);

  if (error) return <p className="text-red-500">Failed to load logs.</p>;
  if (!data) return <p>Loading logs...</p>;

  return (
    <div className="h-screen w-auto overflow-hidden bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Log Processing Dashboard</h1>
      <hr />
      <br />

      <h2 className="  text-xl font-semibold ">Live Processing Feed</h2>
      <div className="max-h-[20vh] overflow-auto border rounded-lg bg-white shadow-md">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Job ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Progress</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(jobProgress).map(([jobId, progress]) => (
              <tr key={jobId} className="border-b bg-yellow-100">
                <td className="p-2">{jobId}</td>
                <td className="p-2">Processing</td>
                <td className="p-2">{progress}%</td>
              </tr>
            ))}
            {liveFeed.map((log, index) => (
              <tr key={index} className="border-b bg-green-100">
                <td className="p-2">{log.jobId}</td>
                <td className="p-2">Completed</td>
                <td className="p-2">100%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold mt-4">Processed Job Results</h2>
      <div className="max-h-[40vh] overflow-auto border rounded-lg bg-white shadow-md">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Filename</th>
              <th className="p-2">Errors</th>
              <th className="p-2">Unique IPs</th>
              <th className="p-2">Keywords</th>
            </tr>
          </thead>
          <tbody>
            {data.map((log: any) => (
              <tr key={log.id} className="border-b">
                <td className="p-2">{log.filename}</td>
                <td className="p-2">{log.errors}</td>
                <td className="p-2">{log.unique_ips.length}</td>
                <td className="p-2">{JSON.stringify(log.keyword_counts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
