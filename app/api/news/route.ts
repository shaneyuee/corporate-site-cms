import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createNews, listNews } from "@/lib/db";
import { LocalizedText } from "@/lib/i18n";

export async function GET() {
  const news = await listNews();
  return NextResponse.json(news);
}

export async function POST(request: NextRequest) {
  const username = getAuthenticatedUser(request);
  if (!username) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    title: string;
    titleI18n?: LocalizedText;
    date: string;
    summary: string;
    summaryI18n?: LocalizedText;
    content: string;
    contentI18n?: LocalizedText;
  };

  const nextNews = await createNews({
    title: payload.title,
    titleI18n: payload.titleI18n,
    date: payload.date,
    summary: payload.summary,
    summaryI18n: payload.summaryI18n,
    content: payload.content,
    contentI18n: payload.contentI18n,
  });

  return NextResponse.json(nextNews, { status: 201 });
}
