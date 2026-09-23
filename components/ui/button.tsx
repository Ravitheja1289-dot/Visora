import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-white shadow-[0_2px_10px_rgba(255,255,255,0.15)] font-semibold border border-transparent",
      secondary:
        "bg-white/[0.08] hover:bg-white/[0.14] text-[#f5f5f7] border border-white/[0.12] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]",
      accent:
        "bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-[0_2px_14px_rgba(0,113,227,0.35)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]",
      outline:
        "bg-transparent text-white/80 hover:text-white border border-white/[0.14] hover:bg-white/[0.06] hover:border-white/[0.25]",
      ghost:
        "bg-transparent text-white/70 hover:text-white hover:bg-white/[0.07]",
      destructive:
        "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25",
    };

    const sizeStyles = {
      sm: "h-7 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-xs tracking-tight font-medium gap-2",
      lg: "h-11 px-6 text-sm tracking-tight font-medium gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
