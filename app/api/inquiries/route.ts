import { NextRequest, NextResponse } from "next/server";
import { createInquiry, listInquiries } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const username = getAuthenticatedUser(request);
  if (!username) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  const inquiries = await listInquiries();
  return NextResponse.json(inquiries);
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    name?: string;
    phone?: string;
    requirement?: string;
    locale?: string;
  };

  const name = payload.name?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const requirement = payload.requirement?.trim() ?? "";

  if (!name || !phone || !requirement) {
    return NextResponse.json({ message: "请完整填写姓名、电话和需求内容" }, { status: 400 });
  }

  const created = await createInquiry({
    name,
    phone,
    requirement,
    locale: payload.locale ?? "zh",
  });

  return NextResponse.json(created, { status: 201 });
}
