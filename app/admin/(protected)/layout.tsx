import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLayoutShell from "@/components/admin-layout-shell";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token || !verifySessionToken(token)) {
    redirect("/admin/login");
  }

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
