import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-300",
  secondary:
    "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 disabled:opacity-50",
  danger: "bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-600 disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-3 py-2 text-sm sm:px-6 sm:py-3 sm:text-base",
};

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...rest}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};
