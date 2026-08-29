"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon } from "@/components/site/Icons";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-control px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <LogOutIcon />
      Log out
    </button>
  );
}
