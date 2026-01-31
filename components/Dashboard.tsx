import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { useTrackers } from "@/context/TrackerContext";
import { cn } from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight, Moon, Plus, Settings, Sun, Target, TrendingUp, X } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StatusBar, Switch, Text, View } from "react-native";

type TabType = "goals" | "measurements";

export function Dashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>("goals");
    const [showSettings, setShowSettings] = useState(false);
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const { store, loading } = useTrackers();

    const isDark = colorScheme === "dark";

    const gradientColors = isDark
        ? ["#09090b", "#18181b"] as const
        : ["#f8fafc", "#f1f5f9"] as const;

    // Calculate stats
    const totalGoalTasks = store.goals.reduce((acc, g) => acc + g.tasks.length, 0);
    const completedGoalTasks = store.goals.reduce((acc, g) => acc + g.tasks.filter(t => t.completed).length, 0);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <View className="flex-1">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <LinearGradient
                colors={gradientColors}
                className="absolute inset-0"
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            <SafeAreaView className="flex-1">
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 120 }}
                    className="px-6 py-8"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-8 pt-2">
                        <View>
                            <Text className="text-foreground text-4xl font-bold tracking-tight">Trackr</Text>
                            <Text className="text-muted-foreground text-base mt-1">Keep moving forward</Text>
                        </View>
                        <IconButton
                            onPress={() => setShowSettings(true)}
                            className="w-14 h-14"
                            variant="ghost"
                            accessibilityLabel="Settings"
                        >
                            <Settings size={24} className="text-foreground" strokeWidth={2} />
                        </IconButton>
                    </View>

                    {/* Tabs */}
                    <Card className="mb-8" variant="elevated" contentClassName="p-2">
                        <View className="flex-row">
                            <Pressable
                                onPress={() => setActiveTab("goals")}
                                className={cn(
                                    "flex-1 py-4 rounded-xl flex-row items-center justify-center gap-3",
                                    activeTab === "goals" ? "bg-primary" : "bg-transparent"
                                )}
                            >
                                <Target
                                    size={20}
                                    className={activeTab === "goals" ? "text-primary-foreground" : "text-muted-foreground"}
                                    strokeWidth={2.5}
                                />
                                <Text className={cn(
                                    "text-base font-semibold",
                                    activeTab === "goals" ? "text-primary-foreground" : "text-muted-foreground"
                                )}>Goals</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setActiveTab("measurements")}
                                className={cn(
                                    "flex-1 py-4 rounded-xl flex-row items-center justify-center gap-3",
                                    activeTab === "measurements" ? "bg-primary" : "bg-transparent"
                                )}
                            >
                                <TrendingUp
                                    size={20}
                                    className={activeTab === "measurements" ? "text-primary-foreground" : "text-muted-foreground"}
                                    strokeWidth={2.5}
                                />
                                <Text className={cn(
                                    "text-base font-semibold",
                                    activeTab === "measurements" ? "text-primary-foreground" : "text-muted-foreground"
                                )}>Measurements</Text>
                            </Pressable>
                        </View>
                    </Card>

                    {/* Quick Stats */}
                    <View className="flex-row gap-4 mb-8">
                        <Card className="flex-1" variant="elevated" contentClassName="p-5">
                            <View className="flex-row items-center gap-3 mb-3">
                                <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center">
                                    <Target size={20} className="text-primary" strokeWidth={2.5} />
                                </View>
                                <Text className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">Goals</Text>
                            </View>
                            <View className="flex-row items-baseline gap-1">
                                <Text className="text-foreground text-3xl font-bold">{completedGoalTasks}</Text>
                                <Text className="text-muted-foreground text-lg">/{totalGoalTasks}</Text>
                            </View>
                        </Card>

                        <Card className="flex-1" variant="elevated" contentClassName="p-5">
                            <View className="flex-row items-center gap-3 mb-3">
                                <View className="w-11 h-11 rounded-full bg-accent/10 items-center justify-center">
                                    <TrendingUp size={20} className="text-accent" strokeWidth={2.5} />
                                </View>
                                <Text className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">Metrics</Text>
                            </View>
                            <View className="flex-row items-baseline gap-1">
                                <Text className="text-foreground text-3xl font-bold">{store.measurements.length}</Text>
                                <Text className="text-muted-foreground text-base">Active</Text>
                            </View>
                        </Card>
                    </View>

                    {/* Goals List */}
                    {activeTab === "goals" && (
                        <View className="gap-4">
                            <Text className="text-foreground text-xl font-semibold mb-2">Your Goals</Text>
                            {store.goals.length === 0 ? (
                                <Card variant="outlined" contentClassName="p-8 items-center">
                                    <Target size={48} className="text-muted-foreground mb-4" />
                                    <Text className="text-foreground font-semibold text-lg mb-1">No goals yet</Text>
                                    <Text className="text-muted-foreground text-center">Tap the + button to create your first goal tracker</Text>
                                </Card>
                            ) : (
                                store.goals.map((tracker) => {
                                    const completed = tracker.tasks.filter(t => t.completed).length;
                                    const total = tracker.tasks.length;
                                    const progress = total > 0 ? (completed / total) * 100 : 0;

                                    return (
                                        <Card key={tracker.id} variant="elevated" contentClassName="p-5">
                                            <Pressable
                                                onPress={() => router.push(`/tracker/${tracker.id}?type=goal`)}
                                                className="active:opacity-80"
                                            >
                                                <View className="flex-row items-start justify-between mb-4">
                                                    <View className="flex-1">
                                                        <Text className="text-foreground font-semibold text-xl">{tracker.name}</Text>
                                                        <View className="flex-row items-center gap-3 mt-2">
                                                            <View className={`px-3 py-1 rounded-full ${tracker.tagColor}`}>
                                                                <Text className="text-xs font-bold text-white uppercase tracking-wide">
                                                                    {tracker.tag}
                                                                </Text>
                                                            </View>
                                                            <Text className="text-muted-foreground text-sm capitalize">
                                                                {tracker.frequency}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <ChevronRight size={24} className="text-muted-foreground mt-1" />
                                                </View>

                                                <View className="gap-2">
                                                    <View className="flex-row justify-between">
                                                        <Text className="text-muted-foreground text-sm">Progress</Text>
                                                        <Text className="text-foreground font-semibold text-sm">
                                                            {Math.round(progress)}%
                                                        </Text>
                                                    </View>
                                                    <View className="h-3 bg-muted rounded-full overflow-hidden">
                                                        <View
                                                            className={`h-full ${tracker.tagColor} rounded-full`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </View>
                                                </View>
                                            </Pressable>
                                        </Card>
                                    );
                                })
                            )}
                        </View>
                    )}

                    {/* Measurements List */}
                    {activeTab === "measurements" && (
                        <View className="gap-4">
                            <Text className="text-foreground text-xl font-semibold mb-2">Your Measurements</Text>
                            {store.measurements.length === 0 ? (
                                <Card variant="outlined" contentClassName="p-8 items-center">
                                    <TrendingUp size={48} className="text-muted-foreground mb-4" />
                                    <Text className="text-foreground font-semibold text-lg mb-1">No measurements yet</Text>
                                    <Text className="text-muted-foreground text-center">Tap the + button to create your first measurement tracker</Text>
                                </Card>
                            ) : (
                                store.measurements.map((tracker) => {
                                    const latestEntry = tracker.entries[tracker.entries.length - 1];
                                    const previousEntry = tracker.entries[tracker.entries.length - 2];
                                    const currentValue = latestEntry?.value ?? 0;
                                    const previousValue = previousEntry?.value ?? currentValue;
                                    const trend = currentValue < previousValue ? "down" : currentValue > previousValue ? "up" : "same";

                                    const getTimeAgo = (date: number) => {
                                        const diff = Date.now() - date;
                                        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
                                        if (days === 0) return "Today";
                                        if (days === 1) return "Yesterday";
                                        return `${days} days ago`;
                                    };

                                    return (
                                        <Card key={tracker.id} variant="elevated" contentClassName="p-5">
                                            <Pressable
                                                onPress={() => router.push(`/tracker/${tracker.id}?type=measurement`)}
                                                className="active:opacity-80 flex-row items-center justify-between"
                                            >
                                                <View>
                                                    <Text className="text-foreground font-semibold text-xl">{tracker.name}</Text>
                                                    <Text className="text-muted-foreground text-sm mt-1">
                                                        Updated {latestEntry ? getTimeAgo(latestEntry.date) : "Never"}
                                                    </Text>
                                                </View>
                                                <View className="flex-row items-center gap-4">
                                                    <View className="items-end">
                                                        <Text className="text-foreground text-2xl font-bold">
                                                            {currentValue}
                                                            <Text className="text-muted-foreground text-base font-normal"> {tracker.unit}</Text>
                                                        </Text>
                                                        {previousEntry && trend !== "same" && (
                                                            <View className={`flex-row items-center gap-1 mt-1 ${trend === "down" ? "bg-accent/10" : "bg-destructive/10"} px-2 py-0.5 rounded-full`}>
                                                                {trend === "down" ? (
                                                                    <TrendingUp size={12} className="text-accent rotate-180" />
                                                                ) : (
                                                                    <TrendingUp size={12} className="text-destructive" />
                                                                )}
                                                                <Text className={`text-xs font-semibold ${trend === "down" ? "text-accent" : "text-destructive"}`}>
                                                                    {Math.abs(currentValue - previousValue).toFixed(1)}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <ChevronRight size={24} className="text-muted-foreground" />
                                                </View>
                                            </Pressable>
                                        </Card>
                                    );
                                })
                            )}
                        </View>
                    )}
                </ScrollView>

                {/* Floating Add Button */}
                <Pressable
                    onPress={() => router.push("/add-tracker")}
                    className="absolute bottom-10 right-6 w-16 h-16 bg-primary rounded-full shadow-xl items-center justify-center active:scale-95"
                    style={{
                        shadowColor: '#4f46e5',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        elevation: 10
                    }}
                >
                    <Plus size={32} className="text-primary-foreground" strokeWidth={2.5} />
                </Pressable>

                {/* Settings Modal */}
                {showSettings && (
                    <View className="absolute inset-0 z-50 justify-end">
                        <Pressable
                            className="absolute inset-0 bg-black/50"
                            onPress={() => setShowSettings(false)}
                        />
                        <View className="bg-background rounded-t-3xl p-8 pb-12 shadow-2xl">
                            <View className="w-14 h-1.5 bg-muted rounded-full mx-auto mb-8" />
                            <View className="flex-row items-center justify-between mb-8">
                                <Text className="text-foreground text-2xl font-bold">Settings</Text>
                                <IconButton
                                    onPress={() => setShowSettings(false)}
                                    className="w-11 h-11"
                                    variant="ghost"
                                >
                                    <X size={20} className="text-muted-foreground" />
                                </IconButton>
                            </View>

                            {/* Dark Mode Toggle */}
                            <Card variant="elevated" contentClassName="py-4 px-5">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-4">
                                        <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                                            {isDark ? (
                                                <Moon size={24} className="text-primary" fill="currentColor" />
                                            ) : (
                                                <Sun size={24} className="text-primary" />
                                            )}
                                        </View>
                                        <View>
                                            <Text className="text-foreground font-semibold text-lg">Dark Mode</Text>
                                            <Text className="text-muted-foreground text-sm">
                                                {isDark ? "On" : "Off"}
                                            </Text>
                                        </View>
                                    </View>
                                    <Switch
                                        value={isDark}
                                        onValueChange={toggleColorScheme}
                                        trackColor={{ false: "#e4e4e7", true: "#6366f1" }}
                                        thumbColor="#ffffff"
                                    />
                                </View>
                            </Card>

                            <Pressable
                                onPress={() => setShowSettings(false)}
                                className="mt-8 py-5 rounded-2xl bg-primary items-center"
                            >
                                <Text className="text-primary-foreground font-semibold text-lg">Done</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}
