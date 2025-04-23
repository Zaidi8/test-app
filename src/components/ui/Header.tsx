// src/components/ui/Header.tsx
import { headerStyles } from "./HeaderStyle";
import { VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

interface HeaderProps extends VariantProps<typeof headerStyles> {
  title: string;
  color?: string;
}

export const Header = ({ title, type, color = "black" }: HeaderProps) => {
  return (
    <h1 className={cn(headerStyles({ type }))} style={{ color }}>
      {title}
    </h1>
  );
};
