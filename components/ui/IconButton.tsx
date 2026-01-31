import React from "react";
import { Pressable, PressableProps, View } from "react-native";
import { cn } from "../../lib/utils";

interface IconButtonProps extends PressableProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "ghost" | "primary";
}

export function IconButton({ children, className, variant = "default", ...props }: IconButtonProps) {
    const variantStyles = {
        default: "bg-card border border-border",
        ghost: "bg-muted/50",
        primary: "bg-primary",
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
