import { Client } from "minio";
import { NextRequest } from "next/server";

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? "127.0.0.1";
const MINIO_PORT = Number(process.env.MINIO_PORT ?? 9000);
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? "minioadmin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY ?? "minioadmin";
const MINIO_BUCKET = process.env.MINIO_BUCKET ?? "website-products";
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL;

declare global {
  var __websiteMinioInitPromise: Promise<void> | undefined;
}

export const minioClient = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

export function getMinioBucketName(): string {
  return MINIO_BUCKET;
}

function isLocalAddress(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function getRequestProtocol(request: NextRequest): string {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedProto === "https" || forwardedProto === "http") {
    return forwardedProto;
  }
  return request.nextUrl.protocol.replace(":", "") || "http";
}

function getRequestHostname(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.host;
  return host.split(":")[0] || "127.0.0.1";
}

function getMinioPublicBaseUrl(request?: NextRequest): string {
  const raw = (MINIO_PUBLIC_URL ?? "").trim();
  if (raw) {
    try {
      const parsed = new URL(raw);
      if (request && isLocalAddress(parsed.hostname)) {
        const protocol = getRequestProtocol(request);
        const hostname = getRequestHostname(request);
        return `${protocol}://${hostname}:${MINIO_PORT}`;
      }
      return raw.replace(/\/$/, "");
    } catch {
      return raw.replace(/\/$/, "");
    }
  }

  if (request) {
    const protocol = getRequestProtocol(request);
    const hostname = getRequestHostname(request);
    return `${protocol}://${hostname}:${MINIO_PORT}`;
  }

  const protocol = MINIO_USE_SSL ? "https" : "http";
  return `${protocol}://127.0.0.1:${MINIO_PORT}`;
}

export function getMinioPublicObjectUrl(objectKey: string, request?: NextRequest): string {
  const cleanBase = getMinioPublicBaseUrl(request);
  return `${cleanBase}/${MINIO_BUCKET}/${objectKey}`;
}

export async function ensureMinioBucket(): Promise<void> {
  if (!globalThis.__websiteMinioInitPromise) {
    globalThis.__websiteMinioInitPromise = (async () => {
      const exists = await minioClient.bucketExists(MINIO_BUCKET);
      if (!exists) {
        await minioClient.makeBucket(MINIO_BUCKET);
      }
    })();
  }

  await globalThis.__websiteMinioInitPromise;
}
