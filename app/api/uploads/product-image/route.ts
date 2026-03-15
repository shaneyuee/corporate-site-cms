import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getAuthenticatedUser } from "@/lib/auth";
import { ensureMinioBucket, getMinioBucketName, getMinioPublicObjectUrl, minioClient } from "@/lib/minio";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;

export async function POST(request: NextRequest) {
  const username = getAuthenticatedUser(request);
  if (!username) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "请选择要上传的图片" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "仅支持图片文件" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: "图片大小不能超过 5MB" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const outputBuffer = await sharp(inputBuffer)
    .rotate()
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const objectKey = `products/${Date.now()}-${randomUUID()}.png`;

  await ensureMinioBucket();
  await minioClient.putObject(getMinioBucketName(), objectKey, outputBuffer, outputBuffer.length, {
    "Content-Type": "image/png",
  });

  return NextResponse.json({
    key: objectKey,
    url: getMinioPublicObjectUrl(objectKey, request),
  });
}
