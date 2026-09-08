import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/35 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-blue text-cloud hover:bg-sea-bright shadow-[0_10px_24px_-14px_rgba(46,65,222,0.7)]",
        secondary:
          "bg-mist text-ink hover:bg-line/60 border border-line/80",
        outline:
          "border border-line bg-cloud text-ink hover:bg-mist",
        ghost: "text-ink-soft hover:bg-mist hover:text-ink",
        star: "bg-orange text-navy hover:bg-star-soft shadow-[0_10px_24px_-14px_rgba(230,138,44,0.8)]",
        navy: "bg-navy text-cloud hover:bg-navy/90",
        destructive: "bg-danger text-white hover:opacity-90",
        link: "text-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-14 rounded-lg px-7 text-base",
        xl: "h-16 rounded-lg px-8 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
