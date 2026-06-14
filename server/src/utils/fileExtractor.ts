import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import WordExtractor from "word-extractor";
import * as XLSX from "xlsx";

const SUPPORTED_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "csv", "txt"]);

const EXCEL_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
]);

export function isSupportedFile(filename: string, mimetype: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (SUPPORTED_EXTENSIONS.has(ext)) return true;
  if (mimetype === "application/pdf") return true;
  if (mimetype.includes("wordprocessingml") || mimetype === "application/msword") return true;
  if (EXCEL_MIME_TYPES.has(mimetype)) return true;
  if (mimetype.startsWith("text/")) return true;
  return false;
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

async function extractDocText(buffer: Buffer): Promise<string> {
  const extractor = new WordExtractor();
  const doc = await extractor.extract(buffer);
  return doc.getBody().trim();
}

function extractExcelText(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const parts: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    if (csv.trim()) {
      parts.push(`Sheet: ${sheetName}\n${csv}`);
    }
  }

  return parts.join("\n\n").trim();
}

export async function extractTextFromFile(
  buffer: Buffer,
  mimetype: string,
  filename: string
): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";

  if (mimetype === "application/pdf" || ext === "pdf") {
    return extractPdfText(buffer);
  }

  if (mimetype.includes("wordprocessingml") || ext === "docx") {
    return extractDocxText(buffer);
  }

  if (mimetype === "application/msword" || ext === "doc") {
    return extractDocText(buffer);
  }

  if (EXCEL_MIME_TYPES.has(mimetype) || ext === "xls" || ext === "xlsx" || ext === "csv") {
    return extractExcelText(buffer);
  }

  if (mimetype.startsWith("text/") || ext === "txt") {
    return buffer.toString("utf-8").trim();
  }

  throw new Error(`Unsupported file type: ${mimetype || ext || "unknown"}`);
}
