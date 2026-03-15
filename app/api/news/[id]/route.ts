import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { deleteNews, updateNews } from "@/lib/db";
import { LocalizedText } from "@/lib/i18n";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const username = getAuthenticatedUser(request);
  if (!username) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = (await request.json()) as {
    title: string;
    titleI18n?: LocalizedText;
    date: string;
    summary: string;
    summaryI18n?: LocalizedText;
    content: string;
    contentI18n?: LocalizedText;
  };

  const newsId = Number(id);
  const updated = await updateNews(newsId, {
    title: payload.title,
    titleI18n: payload.titleI18n,
    date: payload.date,
    summary: payload.summary,
    summaryI18n: payload.summaryI18n,
    content: payload.content,
    contentI18n: payload.contentI18n,
  });

  if (!updated) {
    return NextResponse.json({ message: "News not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const username = getAuthenticatedUser(_request);
  if (!username) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const { id } = await context.params;
  const newsId = Number(id);
  const deleted = await deleteNews(newsId);

  if (!deleted) {
    return NextResponse.json({ message: "News not found" }, { status: 404 });
  }

  return NextResponse.json(deleted);
}
