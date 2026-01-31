import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { useTrackers } from "@/context/TrackerContext";
import { cn } from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Check, ChevronDown, Trash2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StatusBar, Text, View } from "react-native";
import { Circle, Svg } from "react-native-svg";

interface GoalTrackerDetailProps {
    trackerId: string;
}

export function GoalTrackerDetail({ trackerId }: GoalTrackerDetailProps) {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const { getGoalTracker, toggleTask, deleteGoalTracker } = useTrackers();
    const isDark = colorScheme === "dark";
    const [viewMode, setViewMode] = useState<"current" | "overall">("current");

    const tracker = getGoalTracker(trackerId);

    const gradientColors = isDark
        ? ["#09090b", "#18181b"] as const
        : ["#f8fafc", "#f1f5f9"] as const;

    if (!tracker) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <Text className="text-foreground text-lg">Tracker not found</Text>
            </View>
        );
    }

    const handleToggleTask = async (taskId: string) => {
        await toggleTask(trackerId, taskId);
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Tracker",
            `Are you sure you want to delete "${tracker.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteGoalTracker(trackerId);
                        router.back();
                    },
                },
            ]
        );
    };

    const completedCount = tracker.tasks.filter(t => t.completed).length;
    const totalCount = tracker.tasks.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const size = 100;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference * (1 - percentage / 100);

    const getTagColor = (tag: string) => {
        switch (tag.toLowerCase()) {
            case "health": return "#10b981";
            case "academic": return "#6366f1";
            case "fitness": return "#f59e0b";
            case "work": return "#db2777";
            default: return "#6366f1";
        }
    };

    const getPeriodLabel = () => {
        switch (tracker.frequency) {
            case "daily": return "Today";
            case "weekly": return "This Week";
            case "monthly": return "This Month";
            default: return "Current Period";
        }
    };

    return (
        <View className="flex-1">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <LinearGradient colors={gradientColors} className="absolute inset-0" start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
            <SafeAreaView className="flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 50 }} className="px-6 py-8">
                    {/* Header */}
                    <View className="flex-row items-center gap-4 mb-8 pt-2">
                        <IconButton onPress={() => router.back()} className="w-12 h-12" variant="ghost">
                            <ArrowLeft size={24} className="text-foreground" />
                        </IconButton>
                        <View className="flex-1">
                            <Text className="text-foreground text-3xl font-bold">{tracker.name}</Text>
                            <View className="flex-row items-center gap-3 mt-2">
                                <View className={`px-3 py-1 rounded-full ${tracker.tagColor}`}>
                                    <Text className="text-xs font-bold text-white uppercase">{tracker.tag}</Text>
                                </View>
                                <Text className="text-muted-foreground text-sm capitalize">{tracker.frequency}</Text>
                            </View>
                        </View>
                        <IconButton onPress={handleDelete} className="w-12 h-12" variant="ghost">
                            <Trash2 size={22} className="text-destructive" />
                        </IconButton>
                    </View>

                    {/* View Toggle */}
                    <Card className="mb-8" variant="elevated" contentClassName="p-2">
                        <View className="flex-row">
                            <Pressable
                                onPress={() => setViewMode("current")}
                                className={cn(
                                    "flex-1 py-3.5 rounded-xl items-center",
                                    viewMode === "current" ? "bg-primary" : "bg-transparent"
                                )}
                            >
                                <Text className={cn(
                                    "text-base font-semibold",
                                    viewMode === "current" ? "text-primary-foreground" : "text-muted-foreground"
                                )}>Current Period</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setViewMode("overall")}
                                className={cn(
                                    "flex-1 py-3.5 rounded-xl items-center",
                                    viewMode === "overall" ? "bg-primary" : "bg-transparent"
                                )}
                            >
                                <Text className={cn(
                                    "text-base font-semibold",
                                    viewMode === "overall" ? "text-primary-foreground" : "text-muted-foreground"
                                )}>Stats</Text>
                            </Pressable>
                        </View>
                    </Card>

                    {viewMode === "current" ? (
                        <View className="gap-5">
                            {/* Tasks */}
                            <Card variant="elevated" contentClassName="p-5">
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text className="text-foreground text-lg font-semibold">Tasks</Text>
                                    <View className="flex-row items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                                        <Calendar size={14} className="text-primary" />
                                        <Text className="text-primary text-sm font-medium">{getPeriodLabel()}</Text>
                                        <ChevronDown size={14} className="text-primary" />
                                    </View>
                                </View>
                                <View className="gap-3">
                                    {tracker.tasks.map(task => (
                                        <Pressable
                                            key={task.id}
                                            onPress={() => handleToggleTask(task.id)}
                                            className="flex-row items-center gap-4 p-4 rounded-xl bg-muted/50 active:bg-muted"
                                        >
                                            <View className={cn(
                                                "w-6 h-6 rounded-full border-2 items-center justify-center",
                                                task.completed ? `${tracker.tagColor} border-transparent` : "border-muted-foreground/30"
                                            )}>
                                                {task.completed && <Check size={14} className="text-white" strokeWidth={3} />}
                                            </View>
                                            <Text className={cn(
                                                "flex-1 text-base",
                                                task.completed ? "text-muted-foreground line-through" : "text-foreground"
                                            )}>{task.name}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </Card>

                            {/* Progress */}
                            <Card variant="elevated" contentClassName="p-6">
                                <Text className="text-foreground text-lg font-semibold mb-5">Current Progress</Text>
                                <View className="flex-row items-center gap-8">
                                    <View className="items-center justify-center">
                                        <Svg width={size} height={size} className="-rotate-90">
                                            <Circle
                                                cx={size / 2}
                                                cy={size / 2}
                                                r={radius}
                                                stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
                                                strokeWidth={strokeWidth}
                                                fill="transparent"
                                            />
                                            <Circle
                                                cx={size / 2}
                                                cy={size / 2}
                                                r={radius}
                                                stroke={getTagColor(tracker.tag)}
                                                strokeWidth={strokeWidth}
                                                fill="transparent"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={progressOffset}
                                                strokeLinecap="round"
                                            />
                                        </Svg>
                                        <View className="absolute inset-0 items-center justify-center">
                                            <Text className="text-foreground text-2xl font-bold">{percentage}%</Text>
                                        </View>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-foreground text-xl font-semibold">
                                            {completedCount} of {totalCount} tasks
                                        </Text>
                                        <Text className="text-muted-foreground text-sm mt-1">{getPeriodLabel()}</Text>
                                        {completedCount === totalCount ? (
                                            <Text className="text-accent text-base font-medium mt-3">All done! 🎉</Text>
                                        ) : (
                                            <Text className="text-muted-foreground text-base mt-3">{totalCount - completedCount} remaining</Text>
                                        )}
                                    </View>
                                </View>
                            </Card>

                            <Pressable className="bg-primary py-5 rounded-2xl items-center">
                                <Text className="text-primary-foreground font-semibold text-lg">Mark All Complete</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View className="gap-5">
                            {/* Summary Stats */}
                            <Card variant="elevated" contentClassName="p-6">
                                <Text className="text-foreground text-lg font-semibold mb-5">Overview</Text>
                                <View className="flex-row justify-between">
                                    <View className="items-center flex-1">
                                        <Text className="text-3xl font-bold text-foreground">{totalCount}</Text>
                                        <Text className="text-muted-foreground text-sm mt-1">Total Tasks</Text>
                                    </View>
                                    <View className="items-center flex-1">
                                        <Text className="text-3xl font-bold text-accent">{completedCount}</Text>
                                        <Text className="text-muted-foreground text-sm mt-1">Completed</Text>
                                    </View>
                                    <View className="items-center flex-1">
                                        <Text className="text-3xl font-bold text-foreground">{percentage}%</Text>
                                        <Text className="text-muted-foreground text-sm mt-1">Progress</Text>
                                    </View>
                                </View>
                            </Card>

                            {/* Streak Info */}
                            <Card variant="elevated" contentClassName="p-6">
                                <Text className="text-foreground text-lg font-semibold mb-4">Streak</Text>
                                <View className="flex-row items-center gap-4">
                                    <View className="w-16 h-16 rounded-2xl bg-accent/10 items-center justify-center">
                                        <Text className="text-accent text-2xl font-bold">🔥</Text>
                                    </View>
                                    <View>
                                        <Text className="text-foreground text-2xl font-bold">7 days</Text>
                                        <Text className="text-muted-foreground text-sm">Current streak</Text>
                                    </View>
                                </View>
                            </Card>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
