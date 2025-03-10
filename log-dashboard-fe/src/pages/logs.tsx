import useSWR from "swr";
import { api } from "@/api/axios";
// import axios from "axios";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function LogsDashboard() {
  const { data, error } = useSWR("http://localhost:3002/api/stats", fetcher, {
    refreshInterval: 5000,
  });

  if (error) return <p className="text-red-500">Failed to load logs.</p>;
  if (!data) return <p>Loading logs...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Processed Logs</h1>
      <table className="min-w-full bg-white shadow-md rounded-lg">
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
  );
}
