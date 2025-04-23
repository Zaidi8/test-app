// src/components/ui/TextLink.tsx

"use client";

import Link from "next/link";
import { cn } from "@/utils/cn";

interface TextLinkProps {
  label: string;
  href: string;
  className?: string;
}

export const TextLink = ({ label, href, className }: TextLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm text-white hover:underline cursor-pointer",
        className
      )}
    >
      {label}
    </Link>
  );
};
