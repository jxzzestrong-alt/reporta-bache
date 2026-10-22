import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

/*
  Botones "de señalamiento": tienen una base sólida debajo que se hunde al tocarlos,
  como un botón físico. Así se siente la respuesta incluso bajo el sol.
*/
export const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 rounded-[var(--radius-control)] border-2 font-bold transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:transition-transform",
  {
    variants: {
      variant: {
        primary:
          "border-asfalto bg-asfalto text-white shadow-[0_4px_0_0_#000] hover:-translate-y-0.5 hover:bg-asfalto-2 hover:shadow-[0_6px_0_0_#000] active:translate-y-[3px] active:shadow-[0_1px_0_0_#000] hover:[&_svg:last-child]:translate-x-0.5",
        paint:
          "border-asfalto bg-pintura text-asfalto shadow-[0_4px_0_0_var(--color-asfalto)] hover:-translate-y-0.5 hover:bg-[#ffd04d] hover:shadow-[0_6px_0_0_var(--color-asfalto)] active:translate-y-[3px] active:bg-pintura-oscura active:shadow-[0_1px_0_0_var(--color-asfalto)]",
        outline:
          "border-asfalto bg-white text-asfalto shadow-[0_4px_0_0_var(--color-asfalto)] hover:-translate-y-0.5 hover:bg-banqueta hover:shadow-[0_6px_0_0_var(--color-asfalto)] active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--color-asfalto)]",
        light:
          "border-white/80 bg-white/5 text-white shadow-[0_4px_0_0_rgb(255_255_255_/_0.35)] hover:-translate-y-0.5 hover:border-white hover:bg-white/15 hover:shadow-[0_6px_0_0_rgb(255_255_255_/_0.45)] active:translate-y-[3px] active:shadow-[0_1px_0_0_rgb(255_255_255_/_0.35)]",
        ghost: "border-transparent bg-transparent text-asfalto hover:bg-black/5 active:bg-black/10",
        success:
          "border-letrero bg-letrero text-white shadow-[0_4px_0_0_#00402d] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#00402d] active:translate-y-[3px] active:shadow-[0_1px_0_0_#00402d]",
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
