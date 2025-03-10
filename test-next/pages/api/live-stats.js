import { Server } from "ws";

let wss; // Global WebSocket server instance

export default function handler(req, res) {
  if (!res.socket.server.wss) {
    console.log("Initializing WebSocket server...");

    // Create a new WebSocket server
    wss = new Server({ noServer: true });

    // Attach the WebSocket server to the Next.js HTTP server
    res.socket.server.on("upgrade", (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });

    wss.on("connection", (ws) => {
      console.log("Client connected to WebSocket");

      // Send a welcome message to the client
      ws.send(JSON.stringify({ message: "Connected to live stats" }));

      ws.on("close", () => console.log("Client disconnected"));
    });

    res.socket.server.wss = wss; // Save instance to prevent reinitialization
  }

  res.end();
}

// Prevents Next.js from closing the WebSocket connection
export const config = {
  api: { bodyParser: false },
};
