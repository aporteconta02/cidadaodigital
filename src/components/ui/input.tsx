import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[12px] border border-[rgba(124,58,237,0.3)] bg-white/[0.05] px-3 py-2 text-base text-text-primary transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-[#7c3aed] focus-visible:ring-[3px] focus-visible:ring-[rgba(124,58,237,0.15)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
