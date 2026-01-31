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
    const variantStyles = {
        default: "bg-card shadow-sm",
        elevated: "bg-card shadow-lg",
        outlined: "bg-card/80 border border-border",
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
