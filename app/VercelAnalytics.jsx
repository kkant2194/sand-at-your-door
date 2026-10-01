"use client";

import { Analytics } from "@vercel/analytics/next";
import { usePathname } from "next/navigation";

export default function VercelAnalytics() {
  const pathname = usePathname();
  if (process.env.NODE_ENV !== "production" || pathname?.startsWith("/admin")) return null;

  return (
    <Analytics
      beforeSend={(event) => {
        const url = new URL(event.url);
        if (url.pathname.startsWith("/admin")) return null;
        url.search = "";
        url.hash = "";
        return { ...event, url: url.toString() };
      }}
    />
  );
}
