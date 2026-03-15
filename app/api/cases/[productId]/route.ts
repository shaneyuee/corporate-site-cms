import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { ProductCaseStudy, updateProductCaseStudies } from "@/lib/db";
import { LocalizedText } from "@/lib/i18n";

export async function PUT(request: NextRequest, context: { params: Promise<{ productId: string }> }) {
  const username = getAuthenticatedUser(request);
  if (!username) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const { productId } = await context.params;
  const payload = (await request.json()) as {
    caseStudies?: Array<{ title?: LocalizedText; summary?: LocalizedText; image?: string }>;
  };

  const normalized: ProductCaseStudy[] = (payload.caseStudies ?? []).map((item) => ({
    title: {
      zh: item.title?.zh ?? "",
      en: item.title?.en ?? "",
      ja: item.title?.ja ?? "",
      ko: item.title?.ko ?? "",
    },
    summary: {
      zh: item.summary?.zh ?? "",
      en: item.summary?.en ?? "",
      ja: item.summary?.ja ?? "",
      ko: item.summary?.ko ?? "",
    },
    image: item.image ?? "",
  }));

  const updated = await updateProductCaseStudies(Number(productId), normalized);
  if (!updated) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
