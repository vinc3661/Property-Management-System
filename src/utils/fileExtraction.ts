
import * as XLSX from "xlsx";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { createWorker } from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export type ExtractedFile = {
  format: "spreadsheet" | "word" | "pdf" | "image";
  text: string;
  rows?: Record<string, unknown>[];
};

export async function extractFileContent(
  file: File
): Promise<ExtractedFile> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  // EXCEL AND CSV
  if (extension === "xlsx" || extension === "csv") {
    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true,
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      throw new Error("No worksheet found in this file.");
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      sheet,
      { defval: "" }
    );

    return {
      format: "spreadsheet",
      text: XLSX.utils.sheet_to_csv(sheet),
      rows,
    };
  }

  // WORD DOCUMENTS
  if (extension === "docx") {
    const buffer = await file.arrayBuffer();

    const result = await mammoth.extractRawText({
      arrayBuffer: buffer,
    });

    if (!result.value.trim()) {
      throw new Error("No readable text found in the Word document.");
    }

    return {
      format: "word",
      text: result.value,
    };
  }

  // PDF DOCUMENTS
  if (extension === "pdf") {
    const buffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
    }).promise;

    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item) => {
          if ("str" in item) return item.str;
          return "";
        })
        .join(" ");

      pages.push(pageText);
    }

    const text = pages.join("\n");

    if (!text.trim()) {
      throw new Error(
        "This PDF contains no selectable text. It may be a scanned document. Try uploading it as an image or using OCR."
      );
    }

    return {
      format: "pdf",
      text,
    };
  }

  // IMAGES AND SCANNED DOCUMENTS
  if (
    ["jpg", "jpeg", "png", "webp", "bmp"].includes(extension ?? "")
  ) {
    const worker = await createWorker("eng");

    try {
      const result = await worker.recognize(file);
      const text = result.data.text.trim();

      if (!text) {
        throw new Error("No readable text found in the image.");
      }

      return {
        format: "image",
        text,
      };
    } finally {
      await worker.terminate();
    }
  }

  throw new Error(
    "Unsupported file. Upload XLSX, CSV, DOCX, PDF, JPG, PNG or WEBP."
  );
}
