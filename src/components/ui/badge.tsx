import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white shadow hover:brightness-110",
        secondary: "border-transparent bg-secondary text-white hover:brightness-110",
        success: "border-transparent bg-success text-white hover:brightness-110",
        danger: "border-transparent bg-danger text-white hover:brightness-110",
        warning: "border-transparent bg-warning text-white hover:brightness-110",
        gold: "border-transparent bg-gradient-gold text-bg-primary font-black shadow-sm",
        outline: "border-border-custom bg-transparent text-text-muted",
        info: "border-transparent bg-primary/20 text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
