"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfToText = exports.proxyImageGenerator = void 0;
const fs_1 = require("fs");
const uuid_1 = require("uuid");
const pdf2json_1 = __importDefault(require("pdf2json"));
const path_1 = __importDefault(require("path"));
const proxyImageGenerator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            return res.status(400).send("Image URL required");
        }
        if (!imageUrl.includes("googleusercontent.com") &&
            !imageUrl.includes("google.com")) {
            return res.status(403).send("Only Google images can be proxied");
        }
        const response = yield fetch(imageUrl);
        if (!response.ok) {
            return res.status(response.status).send("Failed to fetch image");
        }
        const buffer = yield response.arrayBuffer();
        const contentType = response.headers.get("content-type");
        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }
        res.send(Buffer.from(buffer));
    }
    catch (error) {
        console.error("Image proxy error:", error);
        res.status(500).send("Failed to proxy image");
    }
});
exports.proxyImageGenerator = proxyImageGenerator;
const pdfToText = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const CHUNK_SIZE = 100000;
    const pageNumber = parseInt(req.body.page || "1", 10);
    const uploadedFile = req.file;
    if (!uploadedFile) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const fileName = (0, uuid_1.v4)();
    const tempFilePath = path_1.default.join("/tmp", `${fileName}.pdf`);
    try {
        yield fs_1.promises.writeFile(tempFilePath, uploadedFile.buffer);
        const parsedText = yield new Promise((resolve, reject) => {
            const pdfParser = new pdf2json_1.default(null, 1);
            pdfParser.on("pdfParser_dataError", (errData) => {
                reject(errData.parserError);
            });
            pdfParser.on("pdfParser_dataReady", () => {
                resolve(pdfParser.getRawTextContent());
            });
            pdfParser.loadPDF(tempFilePath);
        });
        yield fs_1.promises.unlink(tempFilePath);
        const textChunks = [];
        for (let i = 0; i < parsedText.length; i += CHUNK_SIZE) {
            textChunks.push(parsedText.slice(i, i + CHUNK_SIZE));
        }
        const response = {
            fileName,
            textChunk: textChunks[pageNumber - 1] || "",
            totalChunks: textChunks.length,
            currentChunk: pageNumber,
            chunkSize: CHUNK_SIZE,
        };
        return res.json(response);
    }
    catch (error) {
        console.error("Error processing PDF:", error);
        return res.status(500).json({
            error: "Failed to process PDF file",
            details: error.message,
        });
    }
});
exports.pdfToText = pdfToText;
