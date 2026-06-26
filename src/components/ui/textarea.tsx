import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-[12px] border border-[rgba(124,58,237,0.3)] bg-white/[0.05] px-3 py-2 text-base text-text-primary placeholder:text-text-muted transition-all focus-visible:outline-none focus-visible:border-[#7c3aed] focus-visible:ring-[3px] focus-visible:ring-[rgba(124,58,237,0.15)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
