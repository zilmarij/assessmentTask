import { WebSocketServer } from "ws";
if (!global._wss) {
  global._wss = new WebSocketServer({ port: 4000 }); // Use a dedicated port

  global._wss.on("connection", (ws) => {
    console.log("✅ Client connected to WebSocket");

    ws.send(JSON.stringify({ message: "Connected to live updates" }));

    ws.on("close", () => console.log("❌ Client disconnected"));
  });

  console.log("✅ WebSocket server initialized");
}

export function broadcastUpdate(data) {
  if (!global._wss) {
    console.error("🚨 WebSocket server not initialized. Cannot broadcast.");
    return;
  }

  console.log("🔥 Sending WebSocket Update:", data);

  global._wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}
