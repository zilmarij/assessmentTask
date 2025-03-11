import { broadcastUpdate } from "../../lib/websocket.mjs"; // Import WebSocket broadcaster

export default function handler(req, res) {
  res.status(200).json({ message: "WebSocket server is running" });
}
