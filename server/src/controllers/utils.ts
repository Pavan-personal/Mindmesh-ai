import { Request, Response } from "express";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import path from "path";

export const proxyImageGenerator = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      return res.status(400).send("Image URL required");
    }
    if (
      !imageUrl.includes("googleusercontent.com") &&
      !imageUrl.includes("google.com")
    ) {
      return res.status(403).send("Only Google images can be proxied");
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch image");
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type");

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Image proxy error:", error);
    res.status(500).send("Failed to proxy image");
  }
};

type ChunkedResponse = {
  fileName: string;
  textChunk: string;
  totalChunks: number;
  currentChunk: number;
  chunkSize: number;
};

export const pdfToText = async (req: Request, res: Response): Promise<any> => {
  const CHUNK_SIZE = 100000;
  const pageNumber = parseInt(req.body.page || "1", 10);

  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileName = uuidv4();
  const tempFilePath = path.join("/tmp", `${fileName}.pdf`);

  try {
    await fs.writeFile(tempFilePath, uploadedFile.buffer);

    const parsedText: string = await new Promise((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, 1);

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        reject(errData.parserError);
      });

      pdfParser.on("pdfParser_dataReady", () => {
        resolve((pdfParser as any).getRawTextContent());
      });

      pdfParser.loadPDF(tempFilePath);
    });

    await fs.unlink(tempFilePath);

    const textChunks = [];
    for (let i = 0; i < parsedText.length; i += CHUNK_SIZE) {
      textChunks.push(parsedText.slice(i, i + CHUNK_SIZE));
    }

    const response: ChunkedResponse = {
      fileName,
      textChunk: textChunks[pageNumber - 1] || "",
      totalChunks: textChunks.length,
      currentChunk: pageNumber,
      chunkSize: CHUNK_SIZE,
    };

    return res.json(response);
  } catch (error: any) {
    console.error("Error processing PDF:", error);
    return res.status(500).json({
      error: "Failed to process PDF file",
      details: error.message,
    });
  }
};
