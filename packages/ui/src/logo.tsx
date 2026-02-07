import { APP_NAME } from "./lib/constants";
import { cn } from "./lib/utils";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className, size = "md" }: LogoProps) {
    const sizeClasses = {
        sm: "text-base",
        md: "text-lg sm:text-xl",
        lg: "text-2xl sm:text-3xl",
        xl: "text-3xl sm:text-4xl",
    };

    return (
        <div className="flex items-center justify-center">
            <span
                className={cn(
                    "font-bold text-foreground tracking-tight transition-colors",
                    sizeClasses[size],
                    className
                )}
            >
                {APP_NAME}
            </span>
        </div>
    );
}
