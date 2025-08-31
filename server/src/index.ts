import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { verifyToken } from "./middlewares/verifyToken";
import { googleAuthentication, logout, updateWallet } from "./controllers/auth";
import { pdfToText, proxyImageGenerator } from "./controllers/utils";
import {
  getKeywords,
  pdfBasedGeneration,
  topicBasedGeneration,
} from "./controllers/geminAI";
import multer from "multer";
import quizRoutes from "./routes/quiz";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const upload = multer(); // memory storage

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check endpoint for Vercel
app.get("/health", (req: express.Request, res: express.Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0"
  });
});

// API status endpoint
app.get("/api/status", (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: "MindMesh QuizCraft API is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/auth/*",
      quiz: "/api/quiz/*",
      ai: "/api/generate-*",
      utils: "/proxy-image"
    }
  });
});

app.post("/auth/google", googleAuthentication);
app.post("/logout", logout);
app.post("/auth/wallet", verifyToken, updateWallet);

app.get("/proxy-image", verifyToken, proxyImageGenerator);

app.get("/api/generate-topics", verifyToken, getKeywords);

app.post("/api/upload-pdf", verifyToken, upload.single("filepond"), pdfToText);

app.post("/api/pdf-based-generation", verifyToken, pdfBasedGeneration);

app.post("/api/topic-based-generation", verifyToken, topicBasedGeneration);

// Quiz routes
app.use('/api/quiz', quizRoutes);

app.get(
  "/protected",
  verifyToken,
  (req: express.Request, res: express.Response) => {
    res.json({ success: true, user: (req as any).user });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Blocklock integration: Users pay their own gas fees`);
  console.log(`No server private key required`);
});
