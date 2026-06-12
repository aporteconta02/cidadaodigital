import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-text-primary shadow-glow hover:brightness-110",
        destructive: "bg-danger text-text-primary shadow-sm hover:brightness-110",
        outline:
          "border border-border-custom bg-transparent shadow-sm hover:bg-white/5 hover:text-text-primary",
        secondary: "bg-secondary text-text-primary shadow-sm hover:brightness-110",
        ghost: "hover:bg-white/5 hover:text-text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        gold: "bg-gradient-gold text-bg-primary font-bold shadow-card hover:brightness-110",
      },
      size: {
        default: "h-[48px] px-6 py-2 rounded-md",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
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
