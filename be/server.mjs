import express from "express";

import uploadLogsRouter from "./backend/upload-logs.mjs"; // Updated import

const app = express();
app.use(express.json());
app.use("/api", uploadLogsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
