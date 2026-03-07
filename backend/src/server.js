// ─── Zengineering V4 — Backend Server ────────────────────────────────────────
import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRouter from "./routes/api.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json({ limit: "10mb" }));

// ── Request logger ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", apiRouter);

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: err.message || "Erreur serveur interne" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║       🚀  ZENGINEERING V4 — Backend IA               ║
║                                                      ║
║  Server    : http://localhost:${PORT}                  ║
║  API       : http://localhost:${PORT}/api               ║
║  Health    : http://localhost:${PORT}/api/health        ║
║  Claude    : ${process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20251001"}  ║
╚══════════════════════════════════════════════════════╝
  `);
});
