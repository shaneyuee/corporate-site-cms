import { NextResponse } from "next/server";
import { listProducts } from "@/lib/db";

export async function GET() {
  const products = await listProducts();

  const cases = products.flatMap((product) =>
    (product.caseStudies ?? []).map((item, index) => ({
      id: `${product.id}-${index}`,
      productId: product.id,
      caseIndex: index,
      productName: product.name,
      productNameI18n: product.nameI18n,
      category: product.category,
      categoryI18n: product.categoryI18n,
      title: item.title,
      summary: item.summary,
      image: item.image,
    })),
  );

  return NextResponse.json(cases);
}
