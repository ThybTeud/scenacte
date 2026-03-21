import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "border-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground focus-visible:z-10 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
                destructive:
                    "bg-destructive text-white hover:bg-destructive-hover active:bg-destructive-active dark:bg-destructive/60",
                secondary:
                    "bg-white text-secondary-foreground hover:bg-surface-hover active:bg-surface-active",
                ghost: "border-none hover:bg-surface-hover hover:text-secondary-foreground active:bg-surface-active dark:hover:bg-accent/50",
                link: "border-none text-primary underline-offset-4 hover:underline hover:decoration-2 active:decoration-4 hover:text-primary-hover active:text-primary-active",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-sm px-6 has-[>svg]:px-4",
                icon: "size-9",
                "icon-sm": "size-8",
                "icon-lg": "size-10",
            },
            depth: {
                flat: "",
                raised: "shadow-brutal hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-brutal-active active:translate-x-0.5 active:translate-y-0.5 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0",
            },
        },
        compoundVariants: [
            { variant: "ghost", depth: "raised", className: "shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0 active:shadow-none active:translate-x-0 active:translate-y-0" },
            { variant: "link", depth: "raised", className: "shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0 active:shadow-none active:translate-x-0 active:translate-y-0" },
        ],
        defaultVariants: {
            variant: "default",
            size: "default",
            depth: "flat",
        },
    }
);

function Button({
    className,
    variant = "default",
    size = "default",
    depth = "flat",
    asChild = false,
    ...props
}) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            data-depth={depth}
            className={cn(buttonVariants({ variant, size, depth, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
