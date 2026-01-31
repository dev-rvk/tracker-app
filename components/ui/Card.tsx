import React from "react";
import { View, ViewProps } from "react-native";
import { cn } from "../../lib/utils";

interface CardProps extends ViewProps {
    variant?: "default" | "elevated" | "outlined";
    contentClassName?: string;
}

export function Card({
    children,
    className,
    contentClassName,
    variant = "default",
    ...props
}: CardProps) {
    // Using explicit dark: variants for proper dark mode support
    const variantStyles = {
        default: "bg-white dark:bg-zinc-900 shadow-sm",
        elevated: "bg-white dark:bg-zinc-900 shadow-lg",
        outlined: "bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700",
    };

    return (
        <View
            className={cn(
                "rounded-2xl overflow-hidden",
                variantStyles[variant],
                className
            )}
            {...props}
        >
            <View className={cn("p-4", contentClassName)}>
                {children}
            </View>
        </View>
    );
}
