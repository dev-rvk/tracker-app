import { BlurView } from "expo-blur";
import React from "react";
import { Pressable, PressableProps } from "react-native";
import { cn } from "../../lib/utils";

interface GlassButtonProps extends PressableProps {
    children: React.ReactNode;
    className?: string;
}

export function GlassButton({ children, className, ...props }: GlassButtonProps) {
    return (
        <Pressable
            className={cn("overflow-hidden rounded-full border border-glass-border active:scale-95 transition-transform", className)}
            {...props}
        >
            {({ pressed }) => (
                <BlurView
                    intensity={pressed ? 50 : 30}
                    tint="default"
                    className={cn(`flex-1 flex items-center justify-center p-2`, pressed ? 'bg-glass-heavy' : 'bg-glass')}
                >
                    {children}
                </BlurView>
            )}
        </Pressable>
    );
}
