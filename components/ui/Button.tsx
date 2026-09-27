import React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "dashed";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold select-none " +
  "transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150 active:scale-[0.97] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-fg shadow-soft hover:bg-primary-hover",
  secondary: "bg-surface-2 text-fg hover:bg-surface-3",
  outline: "border border-line bg-surface text-fg-secondary hover:bg-surface-2 hover:text-fg hover:border-line-strong",
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
  danger: "bg-danger text-white hover:bg-danger/90",
  dashed: "border border-dashed border-line-strong text-fg-muted hover:border-primary/60 hover:text-primary hover:bg-primary/5",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-3.5 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "h-9 w-9 p-0",
  "icon-sm": "h-8 w-8 p-0 rounded-lg",
};

/** Class string for non-button elements (e.g. next/link) that should look like buttons. */
export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={buttonVariants({ variant, size, className })} {...props} />
  )
);
Button.displayName = "Button";

export interface IconButtonProps extends Omit<ButtonProps, "size"> {
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  size?: "icon" | "icon-sm";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, variant = "ghost", size = "icon-sm", title, ...props }, ref) => (
    <Button ref={ref} variant={variant} size={size} aria-label={label} title={title ?? label} {...props} />
  )
);
IconButton.displayName = "IconButton";
