import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function GlassCard({
  children,
  className,
  hover = false,
  padding = "md",
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl",
        paddingMap[padding],
        hover && "glass-card-hover",
        className,
      )}
    >
      {children}
    </div>
  );
}
