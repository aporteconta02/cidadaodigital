import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-semibold cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "text-white bg-[linear-gradient(135deg,#7c3aed,#a855f7)] shadow-[0_4px_15px_rgba(124,58,237,0.4)] hover:brightness-110",
        destructive:
          "text-white bg-[linear-gradient(135deg,#ef4444,#991b1b)] shadow-[0_4px_15px_rgba(239,68,68,0.45)] pulse-red",
        outline:
          "border border-[rgba(124,58,237,0.5)] bg-transparent text-text-primary hover:bg-[rgba(124,58,237,0.08)]",
        secondary:
          "border border-[rgba(124,58,237,0.5)] bg-transparent text-text-primary hover:bg-[rgba(124,58,237,0.08)]",
        ghost: "hover:bg-white/5 hover:text-text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        gold: "bg-gradient-gold text-bg-primary font-bold shadow-card hover:brightness-110",
      },
      size: {
        default: "h-[48px] px-6 py-2 rounded-[12px]",
        sm: "h-9 rounded-[12px] px-3 text-xs",
        lg: "h-12 rounded-[12px] px-8 text-base",
        icon: "h-10 w-10 rounded-[12px]",
        pill: "h-8 rounded-full px-4 text-xs font-bold uppercase tracking-wider",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <>
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="opacity-70">Carregando...</span>
          </>
        ) : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";


export { Button, buttonVariants };
