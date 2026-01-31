import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { useTrackers } from "@/context/TrackerContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Alert, Dimensions, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Circle, Rect, Svg, Text as SvgText } from "react-native-svg";

interface GoalTrackerDetailProps {
    trackerId: string;
}

export function GoalTrackerDetail({ trackerId }: GoalTrackerDetailProps) {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const { getGoalTracker, incrementGoal, decrementGoal, getCurrentPeriodProgress, getGoalHistory, deleteGoalTracker } = useTrackers();
    const isDark = colorScheme === "dark";
    const [viewMode, setViewMode] = useState<"current" | "history">("current");

    const tracker = getGoalTracker(trackerId);
    const progress = tracker ? getCurrentPeriodProgress(trackerId) : { count: 0, frequency: 0, periodStart: 0 };
    const history = tracker ? getGoalHistory(trackerId, 8) : [];

    const gradientColors = isDark
        ? ["#09090b", "#18181b"] as const
        : ["#f8fafc", "#f1f5f9"] as const;

    if (!tracker) {
        return (
            <View className="flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Text className="text-zinc-950 dark:text-zinc-50 text-lg">Tracker not found</Text>
            </View>
        );
    }

    const handleIncrement = async () => {
        if (progress.count < tracker.frequency) {
            await incrementGoal(trackerId);
        }
    };

    const handleDecrement = async () => {
        if (progress.count > 0) {
            await decrementGoal(trackerId);
        }
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

    const percentage = tracker.frequency > 0 ? Math.round((progress.count / tracker.frequency) * 100) : 0;
    const isComplete = progress.count >= tracker.frequency;

    const getTagBgColor = (tagColor: string) => {
        switch (tagColor) {
            case 'bg-tag-health': return '#10b981';
            case 'bg-tag-academic': return '#6366f1';
            case 'bg-tag-fitness': return '#f59e0b';
            case 'bg-tag-work': return '#db2777';
            default: return '#6366f1';
        }
    };

    const getPeriodLabel = () => {
        switch (tracker.period) {
            case "daily": return "Today";
            case "weekly": return "This week";
            case "monthly": return "This month";
        }
    };

    const getPeriodName = () => {
        switch (tracker.period) {
            case "daily": return "day";
            case "weekly": return "week";
            case "monthly": return "month";
        }
    };

    const getPeriodDescription = () => {
        if (tracker.period === "daily") {
            return `${tracker.frequency}x daily`;
        } else if (tracker.period === "weekly") {
            return `${tracker.frequency}x weekly • Starts ${tracker.startDay}`;
        } else {
            return `${tracker.frequency}x monthly • Starts day ${tracker.startDate || 1}`;
        }
    };

    const tagColor = getTagBgColor(tracker.tagColor);

    // Ring chart dimensions
    const ringSize = 180;
    const ringStrokeWidth = 14;
    const ringRadius = (ringSize - ringStrokeWidth) / 2;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringProgressOffset = ringCircumference * (1 - percentage / 100);

    // Bar chart dimensions
    const screenWidth = Dimensions.get("window").width;
    const chartWidth = screenWidth - 80;
    const chartHeight = 200;
    const barWidth = Math.min(40, (chartWidth - 60) / Math.max(history.length, 1) - 8);
    const paddingBottom = 30;
    const paddingTop = 20;
    const graphHeight = chartHeight - paddingBottom - paddingTop;

    const formatPeriodLabel = (periodStart: number) => {
        const date = new Date(periodStart);
        if (tracker.period === "daily") {
            return `${date.getMonth() + 1}/${date.getDate()}`;
        } else if (tracker.period === "weekly") {
            return `${date.getMonth() + 1}/${date.getDate()}`;
        } else {
            return `${date.toLocaleString('default', { month: 'short' })}`;
        }
    };

    return (
        <View className="flex-1">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <LinearGradient
                key={colorScheme}
                colors={gradientColors}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            <SafeAreaView className="flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 50 }} className="px-6 py-8">
                    {/* Header */}
                    <View className="flex-row items-center gap-4 mb-8 pt-2">
                        <IconButton onPress={() => router.back()} className="w-12 h-12" variant="ghost">
                            <ArrowLeft size={24} color={isDark ? '#ffffff' : '#09090b'} />
                        </IconButton>
                        <View className="flex-1">
                            <View className="flex-row items-center gap-3">
                                <Text className="text-zinc-950 dark:text-zinc-50 text-3xl font-bold">{tracker.name}</Text>
                                <View style={{
                                    paddingHorizontal: 10,
                                    paddingVertical: 3,
                                    borderRadius: 12,
                                    backgroundColor: tagColor,
                                }}>
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff', textTransform: 'uppercase' }}>
                                        {tracker.tag}
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-zinc-500 dark:text-zinc-400 text-base mt-0.5">
                                {getPeriodDescription()}
                            </Text>
                        </View>
                        <IconButton onPress={handleDelete} className="w-12 h-12" variant="ghost">
                            <Trash2 size={22} className="text-destructive" />
                        </IconButton>
                    </View>

                    {/* View Toggle */}
                    <Card className="mb-8" variant="elevated" contentClassName="p-2">
                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={() => setViewMode("current")}
                                activeOpacity={0.7}
                                style={{
                                    flex: 1,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    backgroundColor: viewMode === "current" ? '#6366f1' : 'transparent',
                                }}
                            >
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: viewMode === "current" ? '#ffffff' : (isDark ? '#a1a1aa' : '#71717a'),
                                }}>{getPeriodLabel()}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setViewMode("history")}
                                activeOpacity={0.7}
                                style={{
                                    flex: 1,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    backgroundColor: viewMode === "history" ? '#6366f1' : 'transparent',
                                }}
                            >
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: viewMode === "history" ? '#ffffff' : (isDark ? '#a1a1aa' : '#71717a'),
                                }}>History</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>

                    {viewMode === "current" ? (
                        <View className="gap-5">
                            {/* Progress Ring */}
                            <Card variant="elevated" contentClassName="p-6 items-center">
                                <View className="items-center justify-center mb-4">
                                    <Svg width={ringSize} height={ringSize} style={{ transform: [{ rotate: '-90deg' }] }}>
                                        <Circle
                                            cx={ringSize / 2}
                                            cy={ringSize / 2}
                                            r={ringRadius}
                                            stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
                                            strokeWidth={ringStrokeWidth}
                                            fill="transparent"
                                        />
                                        <Circle
                                            cx={ringSize / 2}
                                            cy={ringSize / 2}
                                            r={ringRadius}
                                            stroke={tagColor}
                                            strokeWidth={ringStrokeWidth}
                                            fill="transparent"
                                            strokeDasharray={ringCircumference}
                                            strokeDashoffset={ringProgressOffset}
                                            strokeLinecap="round"
                                        />
                                    </Svg>
                                    <View style={{ position: 'absolute', alignItems: 'center' }}>
                                        <Text className="text-zinc-950 dark:text-zinc-50 text-5xl font-bold">{progress.count}</Text>
                                        <Text className="text-zinc-500 dark:text-zinc-400 text-lg">of {tracker.frequency}</Text>
                                    </View>
                                </View>

                                <Text className="text-zinc-950 dark:text-zinc-50 text-xl font-semibold mb-1">
                                    {isComplete ? "Goal Complete! 🎉" : `${tracker.frequency - progress.count} more to go`}
                                </Text>
                                <Text className="text-zinc-500 dark:text-zinc-400 text-base">
                                    {getPeriodLabel()}
                                </Text>
                            </Card>

                            {/* Counter with +/- buttons */}
                            <Card variant="elevated" contentClassName="p-6">
                                <Text className="text-zinc-950 dark:text-zinc-50 text-lg font-semibold mb-5 text-center">Update Progress</Text>
                                <View className="flex-row items-center justify-center gap-8">
                                    {/* Decrement Button */}
                                    <TouchableOpacity
                                        onPress={handleDecrement}
                                        disabled={progress.count <= 0}
                                        activeOpacity={0.7}
                                        style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 32,
                                            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: progress.count <= 0 ? 0.4 : 1,
                                        }}
                                    >
                                        <Minus size={28} color={isDark ? '#ffffff' : '#09090b'} />
                                    </TouchableOpacity>

                                    {/* Current Count Display */}
                                    <View className="items-center">
                                        <Text className="text-zinc-950 dark:text-zinc-50 text-6xl font-bold">{progress.count}</Text>
                                        <Text className="text-zinc-500 dark:text-zinc-400 text-base mt-1">/{tracker.frequency}</Text>
                                    </View>

                                    {/* Increment Button */}
                                    <TouchableOpacity
                                        onPress={handleIncrement}
                                        disabled={progress.count >= tracker.frequency}
                                        activeOpacity={0.7}
                                        style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 32,
                                            backgroundColor: progress.count >= tracker.frequency
                                                ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)')
                                                : tagColor,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: progress.count >= tracker.frequency ? 0.4 : 1,
                                        }}
                                    >
                                        <Plus size={28} color={progress.count >= tracker.frequency ? (isDark ? '#ffffff' : '#09090b') : '#ffffff'} />
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-zinc-500 dark:text-zinc-400 text-center text-sm mt-5">
                                    Tap + to mark done, - to undo
                                </Text>
                            </Card>

                            {/* Stats */}
                            <View className="flex-row gap-4">
                                <Card className="flex-1" variant="elevated" contentClassName="p-5 items-center">
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-xs uppercase font-semibold mb-2">Streak</Text>
                                    <Text className="text-zinc-950 dark:text-zinc-50 text-3xl font-bold">
                                        {(() => {
                                            let streak = 0;
                                            const sorted = [...history].reverse();
                                            for (const h of sorted) {
                                                if (h.count >= tracker.frequency) streak++;
                                                else break;
                                            }
                                            return streak;
                                        })()}
                                    </Text>
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-sm">{getPeriodName()}s</Text>
                                </Card>
                                <Card className="flex-1" variant="elevated" contentClassName="p-5 items-center">
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-xs uppercase font-semibold mb-2">Completion</Text>
                                    <Text className="text-zinc-950 dark:text-zinc-50 text-3xl font-bold">
                                        {history.length > 0 ? Math.round(history.filter(h => h.count >= tracker.frequency).length / history.length * 100) : 0}%
                                    </Text>
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-sm">all time</Text>
                                </Card>
                            </View>
                        </View>
                    ) : (
                        <View className="gap-5">
                            {/* History Chart */}
                            <Card variant="elevated" contentClassName="p-0">
                                <View className="p-5 pb-0">
                                    <Text className="text-zinc-950 dark:text-zinc-50 text-lg font-semibold mb-2">
                                        {tracker.period === "daily" ? "Daily" : tracker.period === "weekly" ? "Weekly" : "Monthly"} Progress
                                    </Text>
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-sm">
                                        {history.length} {getPeriodName()}{history.length !== 1 ? "s" : ""} tracked
                                    </Text>
                                </View>

                                <View className="items-center p-4">
                                    {history.length > 0 ? (
                                        <Svg width={chartWidth} height={chartHeight}>
                                            {/* Goal line */}
                                            <Rect
                                                x={30}
                                                y={paddingTop}
                                                width={chartWidth - 40}
                                                height={2}
                                                fill={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}
                                            />
                                            <SvgText
                                                x={25}
                                                y={paddingTop + 4}
                                                fontSize="10"
                                                fill={isDark ? "#a1a1aa" : "#71717a"}
                                                textAnchor="end"
                                            >
                                                {tracker.frequency}
                                            </SvgText>
                                            <SvgText
                                                x={25}
                                                y={chartHeight - paddingBottom}
                                                fontSize="10"
                                                fill={isDark ? "#a1a1aa" : "#71717a"}
                                                textAnchor="end"
                                            >
                                                0
                                            </SvgText>

                                            {/* Bars */}
                                            {history.map((record, i) => {
                                                const barHeight = (record.count / tracker.frequency) * graphHeight;
                                                const x = 40 + i * ((chartWidth - 60) / history.length) + (chartWidth - 60) / history.length / 2 - barWidth / 2;
                                                const y = chartHeight - paddingBottom - barHeight;
                                                const isGoalMet = record.count >= tracker.frequency;

                                                return (
                                                    <React.Fragment key={i}>
                                                        <Rect
                                                            x={x}
                                                            y={y}
                                                            width={barWidth}
                                                            height={Math.max(barHeight, 4)}
                                                            rx={6}
                                                            fill={isGoalMet ? tagColor : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)')}
                                                        />
                                                        <SvgText
                                                            x={x + barWidth / 2}
                                                            y={y - 6}
                                                            fontSize="11"
                                                            fill={isDark ? "#ffffff" : "#09090b"}
                                                            textAnchor="middle"
                                                            fontWeight="600"
                                                        >
                                                            {record.count}
                                                        </SvgText>
                                                        <SvgText
                                                            x={x + barWidth / 2}
                                                            y={chartHeight - 8}
                                                            fontSize="9"
                                                            fill={isDark ? "#a1a1aa" : "#71717a"}
                                                            textAnchor="middle"
                                                        >
                                                            {formatPeriodLabel(record.periodStart)}
                                                        </SvgText>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </Svg>
                                    ) : (
                                        <View className="py-12 items-center">
                                            <Text className="text-zinc-500 dark:text-zinc-400 text-base">No history yet</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-3">
                                            <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: tagColor }} />
                                            <Text className="text-zinc-500 dark:text-zinc-400 text-sm">Goal met</Text>
                                        </View>
                                        <View className="flex-row items-center gap-3">
                                            <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }} />
                                            <Text className="text-zinc-500 dark:text-zinc-400 text-sm">Below target</Text>
                                        </View>
                                    </View>
                                </View>
                            </Card>

                            {/* Summary */}
                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-zinc-950 dark:text-zinc-50 text-lg font-semibold mb-4">Summary</Text>
                                <View className="gap-3">
                                    <View className="flex-row justify-between">
                                        <Text className="text-zinc-500 dark:text-zinc-400">Total Completions</Text>
                                        <Text className="text-zinc-950 dark:text-zinc-50 font-semibold">
                                            {history.reduce((acc, h) => acc + h.count, 0)}
                                        </Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-zinc-500 dark:text-zinc-400">Goals Met</Text>
                                        <Text className="text-zinc-950 dark:text-zinc-50 font-semibold">
                                            {history.filter(h => h.count >= tracker.frequency).length} / {history.length}
                                        </Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-zinc-500 dark:text-zinc-400">Best Streak</Text>
                                        <Text className="text-zinc-950 dark:text-zinc-50 font-semibold">
                                            {(() => {
                                                let maxStreak = 0;
                                                let currentStreak = 0;
                                                for (const h of history) {
                                                    if (h.count >= tracker.frequency) {
                                                        currentStreak++;
                                                        maxStreak = Math.max(maxStreak, currentStreak);
                                                    } else {
                                                        currentStreak = 0;
                                                    }
                                                }
                                                return maxStreak;
                                            })()} {getPeriodName()}{(() => {
                                                let maxStreak = 0;
                                                let currentStreak = 0;
                                                for (const h of history) {
                                                    if (h.count >= tracker.frequency) {
                                                        currentStreak++;
                                                        maxStreak = Math.max(maxStreak, currentStreak);
                                                    } else {
                                                        currentStreak = 0;
                                                    }
                                                }
                                                return maxStreak !== 1 ? "s" : "";
                                            })()}
                                        </Text>
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
