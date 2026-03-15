import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { deleteProduct, updateProduct } from "@/lib/db";
import { LocalizedList, LocalizedText } from "@/lib/i18n";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const username = getAuthenticatedUser(request);
  if (!username) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = (await request.json()) as {
    name: string;
    category: string;
    categoryI18n?: LocalizedText;
    summary: string;
    image: string;
    features: string[];
    nameI18n?: LocalizedText;
    summaryI18n?: LocalizedText;
    featuresI18n?: LocalizedList;
    videos?: string[];
    caseStudies?: Array<{ title: LocalizedText; summary: LocalizedText; image: string }>;
  };

  const productId = Number(id);
  const updated = await updateProduct(productId, {
    name: payload.name,
    category: payload.category,
    categoryI18n: payload.categoryI18n,
    summary: payload.summary,
    image: payload.image,
    features: payload.features,
    nameI18n: payload.nameI18n,
    summaryI18n: payload.summaryI18n,
    featuresI18n: payload.featuresI18n,
    videos: payload.videos,
    caseStudies: payload.caseStudies,
  });

  if (!updated) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const username = getAuthenticatedUser(_request);
  if (!username) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const { id } = await context.params;
  const productId = Number(id);
  const deleted = await deleteProduct(productId);

  if (!deleted) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(deleted);
}
