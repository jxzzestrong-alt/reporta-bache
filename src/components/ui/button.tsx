import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] border-2 font-bold transition-[background-color,border-color,color,transform] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border-asfalto bg-asfalto text-white hover:bg-asfalto-2",
        paint: "border-asfalto bg-pintura text-asfalto hover:bg-pintura-oscura",
        outline: "border-asfalto bg-white text-asfalto hover:bg-banqueta",
        ghost: "border-transparent bg-transparent text-asfalto hover:bg-black/5",
        success: "border-letrero bg-letrero text-white hover:brightness-110",
      },
      size: {
        md: "min-h-12 px-4 text-base",
        lg: "min-h-14 px-5 text-lg",
        xl: "min-h-16 px-6 text-xl",
        icon: "size-12",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
