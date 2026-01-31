import { BlurView } from "expo-blur";
import { cssInterop } from "nativewind";
import React from "react";
import { View, ViewProps } from "react-native";
import { cn } from "../../lib/utils";

// Enable styling for BlurView
cssInterop(BlurView, {
    className: "style",
});

interface GlassCardProps extends ViewProps {
    intensity?: number;
    variant?: "default" | "heavy";
    contentClassName?: string;
}

export function GlassCard({
    children,
    className,
    contentClassName,
    intensity = 30,
    variant = "default",
    ...props
}: GlassCardProps) {
    // Determine tinted background color based on variant
    const bgClass = variant === "heavy" ? "bg-glass-heavy" : "bg-glass";

    return (
        <View
            className={cn("rounded-3xl overflow-hidden border border-glass-border shadow-sm", className)}
            {...props}
        >
            <BlurView
                intensity={intensity}
                tint="default"
                className={cn(`flex-1 ${bgClass} p-4`, contentClassName)}
            >
                {children}
            </BlurView>
        </View>
    );
}
