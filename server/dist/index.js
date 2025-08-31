"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const verifyToken_1 = require("./middlewares/verifyToken");
const auth_1 = require("./controllers/auth");
const utils_1 = require("./controllers/utils");
const geminAI_1 = require("./controllers/geminAI");
const multer_1 = __importDefault(require("multer"));
const quiz_1 = __importDefault(require("./routes/quiz"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;
const upload = (0, multer_1.default)(); // memory storage
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Health check endpoint for Vercel
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0"
    });
});
// API status endpoint
app.get("/api/status", (req, res) => {
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
app.post("/auth/google", auth_1.googleAuthentication);
app.post("/logout", auth_1.logout);
app.post("/auth/wallet", verifyToken_1.verifyToken, auth_1.updateWallet);
app.get("/proxy-image", verifyToken_1.verifyToken, utils_1.proxyImageGenerator);
app.get("/api/generate-topics", verifyToken_1.verifyToken, geminAI_1.getKeywords);
app.post("/api/upload-pdf", verifyToken_1.verifyToken, upload.single("filepond"), utils_1.pdfToText);
app.post("/api/pdf-based-generation", verifyToken_1.verifyToken, geminAI_1.pdfBasedGeneration);
app.post("/api/topic-based-generation", verifyToken_1.verifyToken, geminAI_1.topicBasedGeneration);
// Quiz routes
app.use('/api/quiz', quiz_1.default);
app.get("/protected", verifyToken_1.verifyToken, (req, res) => {
    res.json({ success: true, user: req.user });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Blocklock integration: Users pay their own gas fees`);
    console.log(`No server private key required`);
});
