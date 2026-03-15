"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-light-blue hover:text-primary"
    >
      退出登录
    </button>
  );
}
