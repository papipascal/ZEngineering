import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRouter from "./routes/api.js";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: ["http://localhost:5174", "http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json({ limit: "10mb" }));
app.use((req, res, next) => { console.log(`${new Date().toISOString()} ${req.method} ${req.path}`); next(); });
app.use("/api", apiRouter);
app.use((err, req, res, next) => { console.error("❌", err.message); res.status(500).json({ error: err.message }); });

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║     🚀  ZENGINEERING V4.1 — Backend IA Complet           ║
║                                                          ║
║  Server  : http://localhost:${PORT}                      ║
║  API     : http://localhost:${PORT}/api                  ║
║  Health  : http://localhost:${PORT}/api/health           ║
║  Claude  : ${process.env.CLAUDE_MODEL || "claude-sonnet-4-6"}               ║
╚══════════════════════════════════════════════════════════╝
  `);
});
