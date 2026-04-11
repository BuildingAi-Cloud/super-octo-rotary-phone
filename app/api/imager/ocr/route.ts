import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function normalizeText(raw: string): string {
  const withoutControls = Array.from(raw)
    .map((char) => {
      const code = char.charCodeAt(0);
      return (code >= 0 && code <= 31) || code === 127 ? " " : char;
    })
    .join("");

  return withoutControls
    .replace(/\s+/g, " ")
    .trim();
}

function extractTrackingHint(text: string): string | null {
  const upper = text.toUpperCase();
  const candidates = [
    upper.match(/\b1Z[0-9A-Z]{16}\b/),
    upper.match(/\b\d{12,22}\b/),
    upper.match(/\b[A-Z0-9]{8,22}\b/),
  ];

  for (const candidate of candidates) {
    if (candidate && candidate[0]) return candidate[0];
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const language = String(formData.get("lang") || "eng").trim() || "eng";

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
    }

    if (image.size <= 0 || image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `Image must be between 1 byte and ${MAX_IMAGE_BYTES} bytes.` },
        { status: 400 },
      );
    }

    const bytes = await image.arrayBuffer();
    const nodeBuffer = Buffer.from(bytes);

    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker(language);

    try {
      const result = await worker.recognize(nodeBuffer);
      const rawText = String(result?.data?.text || "");
      const confidence = Number(result?.data?.confidence || 0);
      const normalizedText = normalizeText(rawText);
      const trackingHint = extractTrackingHint(normalizedText);

      return NextResponse.json(
        {
          text: normalizedText,
          confidence: Number.isFinite(confidence) ? Number(confidence.toFixed(2)) : 0,
          trackingHint,
          language,
          fileName: image.name,
        },
        { status: 200 },
      );
    } finally {
      await worker.terminate();
    }
  } catch {
    return NextResponse.json(
      { error: "OCR processing failed. Please retry with a clearer image." },
      { status: 500 },
    );
  }
}
