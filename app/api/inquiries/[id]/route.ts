import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { markInquiryAsRead } from "@/lib/db";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const username = getAuthenticatedUser(request);
  if (!username) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const { id } = await context.params;
  const inquiryId = Number(id);
  if (!Number.isFinite(inquiryId)) {
    return NextResponse.json({ message: "无效需求ID" }, { status: 400 });
  }

  const updated = await markInquiryAsRead(inquiryId);
  if (!updated) {
    return NextResponse.json({ message: "需求不存在" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
