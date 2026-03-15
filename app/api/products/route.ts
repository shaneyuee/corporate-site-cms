import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createProduct, listProducts } from "@/lib/db";
import { LocalizedList, LocalizedText } from "@/lib/i18n";

export async function GET() {
  const products = await listProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const username = getAuthenticatedUser(request);
  if (!username) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

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

  const nextProduct = await createProduct({
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

  return NextResponse.json(nextProduct, { status: 201 });
}
