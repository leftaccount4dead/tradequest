import Image from "next/image";
import { cn } from "@/lib/utils";

type TradeQuestLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function TradeQuestLogo({
  size = 44,
  className,
  priority = false,
}: TradeQuestLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="TradeQuest"
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 rounded-xl object-cover", className)}
    />
  );
}
