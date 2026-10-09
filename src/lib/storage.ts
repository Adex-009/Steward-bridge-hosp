import { promises as fs } from "node:fs";
import path from "node:path";

const STORAGE_ROOT = path.resolve(process.env.STORAGE_DIR || "./.data/documents");

function filePath(key: string) {
  const normalized = key.replaceAll("\\", "/").replace(/^\/+/, "");
  const target = path.resolve(STORAGE_ROOT, normalized);
  const relative = path.relative(STORAGE_ROOT, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid storage key");
  }
  return target;
}

export async function putDocument(
  key: string,
  body: ArrayBuffer | ArrayBufferView,
  metadata: { contentType: string; fileName: string },
) {
  const target = filePath(key);
  await fs.mkdir(path.dirname(target), { recursive: true });
  const bytes = Buffer.isBuffer(body)
    ? body
    : ArrayBuffer.isView(body)
      ? Buffer.from(body.buffer, body.byteOffset, body.byteLength)
      : Buffer.from(body);
  await fs.writeFile(target, bytes);
  await fs.writeFile(
    `${target}.meta.json`,
    JSON.stringify({ contentType: metadata.contentType, fileName: metadata.fileName }),
  );
}

export async function getDocument(key: string) {
  const target = filePath(key);
  try {
    const body = await fs.readFile(target);
    let httpMetadata: { contentType?: string } = {};
    try {
      httpMetadata = JSON.parse(await fs.readFile(`${target}.meta.json`, "utf8"));
    } catch {
      // Metadata is optional; fall back to the document's database MIME type.
    }
    return { body, httpMetadata };
  } catch {
    return null;
  }
}

export async function deleteDocumentObject(key: string) {
  const target = filePath(key);
  await Promise.allSettled([fs.unlink(target), fs.unlink(`${target}.meta.json`)]);
}
