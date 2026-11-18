import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8a3d" /><stop offset="1" stopColor="#d1301a" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#lg)" />
      <path d="M21.5 10.5c-1.6-1.6-4.4-2.2-6.6-1.2-2.4 1.1-2.6 4 0 5.2l3 1.3c2.8 1.2 2.6 4.4-.2 5.5-2.3.9-5.1.2-6.7-1.6" stroke="#fff" strokeWidth="2.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
      <LogoMark />
      {BRAND.name}
    </Link>
  );
}
