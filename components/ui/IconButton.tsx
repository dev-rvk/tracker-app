import React from "react";
import { Pressable, PressableProps, View } from "react-native";
import { cn } from "../../lib/utils";

interface IconButtonProps extends PressableProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "ghost" | "primary";
}

export function IconButton({ children, className, variant = "default", ...props }: IconButtonProps) {
    // Using explicit dark: variants for proper dark mode support
    const variantStyles = {
        default: "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700",
        ghost: "bg-zinc-100 dark:bg-zinc-800",
        primary: "bg-indigo-500",
    };

    return (
        <Pressable
            className={cn(
                "overflow-hidden rounded-full active:scale-95 transition-transform items-center justify-center",
                variantStyles[variant],
                className
            )}
            {...props}
        >
            {({ pressed }) => (
                <View className={cn("flex-1 w-full h-full items-center justify-center", pressed && "opacity-70")}>
                    {children}
                </View>
            )}
        </Pressable>
    );
}
