import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="9" fill="var(--brand)" />
        <path d="M9 21c2 2 5 3 8 2s5-3 4-6-5-3-7-4-3-3-1-5 6-1 8 1" stroke="var(--gold)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      {BRAND.name}
    </Link>
  );
}
