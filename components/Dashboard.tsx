import { Card } from "@/components/ui/Card";
import { DragHandle, DraggableList } from "@/components/ui/DraggableList";
import { IconButton } from "@/components/ui/IconButton";
import { useTrackers } from "@/context/TrackerContext";
import { crossPlatformAlert } from "@/lib/crossPlatformAlert";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowDown, ArrowUp, ChevronRight, Download, GripVertical, Minus, Moon, Plus, Settings, Sun, Target, TrendingUp, Upload, X } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StatusBar, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";


type TabType = "goals" | "measurements";

export function Dashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>("goals");
    const [showSettings, setShowSettings] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importText, setImportText] = useState("");
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { colorScheme, setColorScheme } = useColorScheme();
    const { store, loading, incrementGoal, decrementGoal, getCurrentPeriodProgress, getStatsByTag, exportData, importData, reorderGoals, reorderMeasurements } = useTrackers();

    const isDark = colorScheme === "dark";

    const gradientColors = isDark
        ? ["#09090b", "#18181b"] as const
        : ["#f8fafc", "#f1f5f9"] as const;

    // Calculate overall stats
    const tagStats = getStatsByTag();
    const totalCurrentProgress = tagStats.reduce((acc, t) => acc + t.currentProgress, 0);
    const totalCurrentTarget = tagStats.reduce((acc, t) => acc + t.currentTarget, 0);

    // Export data as JSON file download
    const handleExport = () => {
        const jsonData = exportData();
        const filename = `trackr_backup_${new Date().toISOString().split('T')[0]}.json`;

        if (Platform.OS === 'web') {
            // Web: Create a download link
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            crossPlatformAlert("Success", "Data exported successfully!", [{ text: "OK" }]);
        } else {
            // Native: Copy to clipboard as fallback
            // Could use expo-sharing for native file sharing
            crossPlatformAlert("Export Data", `Copy this JSON data:\n\n${jsonData.substring(0, 100)}...`, [{ text: "OK" }]);
        }
    };

    // Import data from JSON
    const handleImport = async () => {
        if (Platform.OS === 'web') {
            // Web: Use file input
            fileInputRef.current?.click();
        } else {
            // Native: Show modal to paste JSON
            setShowImportModal(true);
        }
    };

    // Handle file selection (web)
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result as string;
            setImporting(true);
            const success = await importData(content);
            setImporting(false);

            if (success) {
                crossPlatformAlert("Success", "Data imported successfully!", [{ text: "OK" }]);
                setShowSettings(false);
            } else {
                crossPlatformAlert("Error", "Failed to import data. Please check the JSON format.", [{ text: "OK" }]);
            }
        };
        reader.readAsText(file);

        // Reset input
        if (event.target) {
            event.target.value = '';
        }
    };

    // Handle import from pasted text
    const handleImportFromText = async () => {
        if (!importText.trim()) {
            crossPlatformAlert("Error", "Please paste JSON data", [{ text: "OK" }]);
            return;
        }

        setImporting(true);
        const success = await importData(importText);
        setImporting(false);

        if (success) {
            crossPlatformAlert("Success", "Data imported successfully!", [{ text: "OK" }]);
            setShowImportModal(false);
            setImportText("");
        } else {
            crossPlatformAlert("Error", "Failed to import data. Please check the JSON format.", [{ text: "OK" }]);
        }
    };

    const getTagBgColor = (tagColor: string) => {
        // If it's already a hex color (custom tag), return it directly
        if (tagColor.startsWith('#')) return tagColor;

        switch (tagColor) {
            case 'bg-tag-health': return '#10b981';
            case 'bg-tag-academic': return '#6366f1';
            case 'bg-tag-fitness': return '#f59e0b';
            case 'bg-tag-work': return '#db2777';
            default: return '#6366f1';
        }
    };

    const getPeriodLabel = (period: "daily" | "weekly" | "monthly") => {
        switch (period) {
            case "daily": return "today";
            case "weekly": return "this week";
            case "monthly": return "this month";
        }
    };

    const getPeriodDescription = (tracker: any) => {
        if (tracker.period === "daily") {
            return "Daily";
        } else if (tracker.period === "weekly") {
            return `Weekly • Starts ${tracker.startDay}`;
        } else {
            return `Monthly • Starts day ${tracker.startDate || 1}`;
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    // Debug: log colorScheme

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
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 120 }}
                    className="px-6 py-8"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-8 pt-2">
                        <View>
                            <Text className="text-zinc-950 dark:text-zinc-50 text-4xl font-bold tracking-tight">Trackr</Text>
                            <Text className="text-zinc-500 dark:text-zinc-400 text-base mt-1">Keep moving forward</Text>
                        </View>
                        <IconButton
                            onPress={() => setShowSettings(true)}
                            className="w-14 h-14"
                            variant="ghost"
                            accessibilityLabel="Settings"
                        >
                            <Settings size={24} color={isDark ? '#ffffff' : '#09090b'} strokeWidth={2} />
                        </IconButton>
                    </View>

                    {/* Quick Stats - ABOVE TABS */}
                    <View className="flex-row gap-4 mb-6">
                        <TouchableOpacity
                            className="flex-1"
                            activeOpacity={0.8}
                            onPress={() => setActiveTab("goals")}
                        >
                            <Card className="flex-1" variant="elevated" contentClassName="p-5">
                                <View className="flex-row items-center gap-3 mb-3">
                                    <View className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-500/20 items-center justify-center">
                                        <Target size={20} color="#6366f1" strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold uppercase tracking-wide">Goals</Text>
                                </View>
                                <View className="flex-row items-baseline gap-1">
                                    <Text className="text-zinc-950 dark:text-zinc-50 text-3xl font-bold">{totalCurrentProgress}</Text>
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-lg">/{totalCurrentTarget}</Text>
                                </View>
                            </Card>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1"
                            activeOpacity={0.8}
                            onPress={() => setActiveTab("measurements")}
                        >
                            <Card className="flex-1" variant="elevated" contentClassName="p-5">
                                <View className="flex-row items-center gap-3 mb-3">
                                    <View className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-500/20 items-center justify-center">
                                        <TrendingUp size={20} color="#10b981" strokeWidth={2.5} />
                                    </View>
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold uppercase tracking-wide">Metrics</Text>
                                </View>
                                <View className="flex-row items-baseline gap-1">
                                    <Text className="text-zinc-950 dark:text-zinc-50 text-3xl font-bold">{store.measurements.length}</Text>
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-base">Active</Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <Card className="mb-8" variant="elevated" contentClassName="p-2">
                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={() => setActiveTab("goals")}
                                activeOpacity={0.7}
                                style={{
                                    flex: 1,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 10,
                                    backgroundColor: activeTab === "goals" ? '#6366f1' : 'transparent',
                                }}
                            >
                                <Target
                                    size={20}
                                    color={activeTab === "goals" ? '#ffffff' : (isDark ? '#a1a1aa' : '#71717a')}
                                    strokeWidth={2.5}
                                />
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: activeTab === "goals" ? '#ffffff' : (isDark ? '#a1a1aa' : '#71717a'),
                                }}>Goals</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setActiveTab("measurements")}
                                activeOpacity={0.7}
                                style={{
                                    flex: 1,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 10,
                                    backgroundColor: activeTab === "measurements" ? '#6366f1' : 'transparent',
                                }}
                            >
                                <TrendingUp
                                    size={20}
                                    color={activeTab === "measurements" ? '#ffffff' : (isDark ? '#a1a1aa' : '#71717a')}
                                    strokeWidth={2.5}
                                />
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: activeTab === "measurements" ? '#ffffff' : (isDark ? '#a1a1aa' : '#71717a'),
                                }}>Metrics</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>

                    {/* Goals List */}
                    {activeTab === "goals" && (
                        <View className="gap-4">
                            <Text className="text-zinc-950 dark:text-zinc-50 text-xl font-semibold mb-2">Your Goals</Text>
                            {store.goals.length === 0 ? (
                                <Card variant="outlined" contentClassName="p-8 items-center">
                                    <Target size={48} className="text-zinc-500 dark:text-zinc-400 mb-4" />
                                    <Text className="text-zinc-950 dark:text-zinc-50 font-semibold text-lg mb-1">No goals yet</Text>
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-center">Tap the + button to create your first goal tracker</Text>
                                </Card>
                            ) : (
                                <DraggableList
                                    data={store.goals}
                                    keyExtractor={(tracker) => tracker.id}
                                    itemHeight={140}
                                    onReorder={(from, to) => reorderGoals(from, to)}
                                    renderItem={(tracker, _index, _isDragging, dragHandleProps) => {
                                        const progress = getCurrentPeriodProgress(tracker.id);
                                        const tagColor = getTagBgColor(tracker.tagColor);

                                        return (
                                            <Card variant="elevated" contentClassName="p-0">
                                                <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                                                    {/* Drag Handle */}
                                                    <DragHandle
                                                        dragHandleProps={dragHandleProps}
                                                        style={{
                                                            width: 28,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                            borderTopLeftRadius: 16,
                                                            borderBottomLeftRadius: 16,
                                                        }}
                                                    >
                                                        <GripVertical size={20} color={isDark ? '#52525b' : '#a1a1aa'} />
                                                    </DragHandle>

                                                    {/* Card Content */}
                                                    <View style={{ flex: 1, padding: 20 }}>
                                                        <View className="flex-row items-start justify-between mb-3">
                                                            <View className="flex-1">
                                                                <View className="flex-row items-center gap-3">
                                                                    <Text className="text-zinc-950 dark:text-zinc-50 font-semibold text-xl">{tracker.name}</Text>
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
                                                                <Text className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                                                                    {getPeriodDescription(tracker)}
                                                                </Text>
                                                            </View>
                                                            <TouchableOpacity
                                                                onPress={() => router.push(`/tracker/${tracker.id}?type=goal`)}
                                                                activeOpacity={0.6}
                                                                style={{ padding: 4 }}
                                                            >
                                                                <ChevronRight size={24} color={isDark ? '#71717a' : '#a1a1aa'} />
                                                            </TouchableOpacity>
                                                        </View>

                                                        {/* Progress Counter with +/- buttons - Fixed layout */}
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                                            {/* Decrement Button */}
                                                            <TouchableOpacity
                                                                onPress={() => decrementGoal(tracker.id)}
                                                                disabled={progress.count <= 0}
                                                                activeOpacity={0.7}
                                                                style={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    borderRadius: 18,
                                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    opacity: progress.count <= 0 ? 0.4 : 1,
                                                                }}
                                                            >
                                                                <Minus size={18} color={isDark ? '#ffffff' : '#09090b'} />
                                                            </TouchableOpacity>

                                                            {/* Fixed width container for 4 circles */}
                                                            <View style={{
                                                                width: 130,
                                                                marginHorizontal: 6,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: 6,
                                                            }}>
                                                                {(() => {
                                                                    // Always show exactly 4 circles (or fewer if frequency < 4)
                                                                    const maxCircles = Math.min(4, tracker.frequency);

                                                                    // Calculate starting index to show:
                                                                    // - Show last 3 completed + 1 unchecked (until all done)
                                                                    // - If all done, show the last 4 completed
                                                                    let startIdx = 0;
                                                                    if (tracker.frequency > 4) {
                                                                        if (progress.count >= tracker.frequency) {
                                                                            // All complete: show last 4
                                                                            startIdx = tracker.frequency - 4;
                                                                        } else {
                                                                            // Show up to 3 completed + 1 unchecked
                                                                            startIdx = Math.max(0, progress.count - 3);
                                                                        }
                                                                    }

                                                                    return Array.from({ length: maxCircles }).map((_, idx) => {
                                                                        const actualIdx = startIdx + idx;
                                                                        const isCompleted = actualIdx < progress.count;
                                                                        return (
                                                                            <View
                                                                                key={idx}
                                                                                style={{
                                                                                    width: 28,
                                                                                    height: 28,
                                                                                    borderRadius: 14,
                                                                                    backgroundColor: isCompleted
                                                                                        ? tagColor
                                                                                        : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'),
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                }}
                                                                            >
                                                                                {isCompleted && (
                                                                                    <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 11 }}>✓</Text>
                                                                                )}
                                                                            </View>
                                                                        );
                                                                    });
                                                                })()}
                                                            </View>

                                                            {/* Increment Button */}
                                                            <TouchableOpacity
                                                                onPress={() => incrementGoal(tracker.id)}
                                                                disabled={progress.count >= tracker.frequency}
                                                                activeOpacity={0.7}
                                                                style={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    borderRadius: 18,
                                                                    backgroundColor: progress.count >= tracker.frequency
                                                                        ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)')
                                                                        : tagColor,
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    opacity: progress.count >= tracker.frequency ? 0.4 : 1,
                                                                }}
                                                            >
                                                                <Plus size={18} color={progress.count >= tracker.frequency ? (isDark ? '#ffffff' : '#09090b') : '#ffffff'} />
                                                            </TouchableOpacity>

                                                            {/* Progress text vertical stack */}
                                                            <View style={{ marginLeft: 'auto', width: 80, alignItems: 'center' }}>
                                                                <Text className="text-zinc-950 dark:text-zinc-50 font-bold text-2xl leading-tight">
                                                                    {progress.count}/{tracker.frequency}
                                                                </Text>
                                                                <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                                                                    {getPeriodLabel(tracker.period)}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            </Card>
                                        );
                                    }}
                                />
                            )}

                            {/* Tag Stats */}
                            {tagStats.length > 0 && (
                                <View className="mt-6">
                                    <Text className="text-zinc-950 dark:text-zinc-50 text-xl font-semibold mb-4">Progress by Tag</Text>
                                    {tagStats.map(stat => (
                                        <Card key={stat.tag} className="mb-3" variant="outlined" contentClassName="p-4">
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-row items-center gap-3">
                                                    <View style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 10,
                                                        backgroundColor: getTagBgColor(stat.tagColor) + '20',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}>
                                                        <Target size={18} color={getTagBgColor(stat.tagColor)} />
                                                    </View>
                                                    <View>
                                                        <Text className="text-zinc-950 dark:text-zinc-50 font-semibold">{stat.tag}</Text>
                                                        <Text className="text-zinc-500 dark:text-zinc-400 text-xs">{stat.totalGoals} goal{stat.totalGoals > 1 ? 's' : ''}</Text>
                                                    </View>
                                                </View>
                                                <View className="items-end">
                                                    <Text className="text-zinc-950 dark:text-zinc-50 font-bold text-lg">
                                                        {stat.currentProgress}/{stat.currentTarget}
                                                    </Text>
                                                    <Text className="text-zinc-500 dark:text-zinc-400 text-xs">current</Text>
                                                </View>
                                            </View>
                                        </Card>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Metrics List */}
                    {activeTab === "measurements" && (
                        <View className="gap-4">
                            <Text className="text-zinc-950 dark:text-zinc-50 text-xl font-semibold mb-2">Your Metrics</Text>
                            {store.measurements.length === 0 ? (
                                <Card variant="outlined" contentClassName="p-8 items-center">
                                    <TrendingUp size={48} className="text-zinc-500 dark:text-zinc-400 mb-4" />
                                    <Text className="text-zinc-950 dark:text-zinc-50 font-semibold text-lg mb-1">No measurements yet</Text>
                                    <Text className="text-zinc-500 dark:text-zinc-400 text-center">Tap the + button to create your first measurement tracker</Text>
                                </Card>
                            ) : (
                                <DraggableList
                                    data={store.measurements}
                                    keyExtractor={(tracker) => tracker.id}
                                    itemHeight={100}
                                    onReorder={(from, to) => reorderMeasurements(from, to)}
                                    renderItem={(tracker, _index, _isDragging, dragHandleProps) => {
                                        const latestEntry = tracker.entries[tracker.entries.length - 1];
                                        const previousEntry = tracker.entries[tracker.entries.length - 2];
                                        const currentValue = latestEntry?.value ?? 0;
                                        const previousValue = previousEntry?.value ?? currentValue;
                                        const trend = currentValue < previousValue ? "down" : currentValue > previousValue ? "up" : "same";
                                        const diff = Math.abs(currentValue - previousValue);

                                        const getTimeAgo = (date: number) => {
                                            const diffMs = Date.now() - date;
                                            const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
                                            if (days === 0) return "Today";
                                            if (days === 1) return "Yesterday";
                                            return `${days} days ago`;
                                        };

                                        return (
                                            <Card variant="elevated" contentClassName="p-0">
                                                <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                                                    {/* Drag Handle */}
                                                    <DragHandle
                                                        dragHandleProps={dragHandleProps}
                                                        style={{
                                                            width: 28,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                            borderTopLeftRadius: 16,
                                                            borderBottomLeftRadius: 16,
                                                        }}
                                                    >
                                                        <GripVertical size={20} color={isDark ? '#52525b' : '#a1a1aa'} />
                                                    </DragHandle>

                                                    {/* Card Content */}
                                                    <TouchableOpacity
                                                        onPress={() => router.push(`/tracker/${tracker.id}?type=measurement`)}
                                                        activeOpacity={0.8}
                                                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}
                                                    >
                                                        <View>
                                                            <Text className="text-zinc-950 dark:text-zinc-50 font-semibold text-xl">{tracker.name}</Text>
                                                            <Text className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                                                                Updated {latestEntry ? getTimeAgo(latestEntry.date) : "Never"}
                                                            </Text>
                                                        </View>
                                                        <View className="flex-row items-center gap-4">
                                                            <View className="items-end">
                                                                <Text className="text-zinc-950 dark:text-zinc-50 text-2xl font-bold">
                                                                    {currentValue}
                                                                    <Text className="text-zinc-500 dark:text-zinc-400 text-base font-normal"> {tracker.unit}</Text>
                                                                </Text>
                                                                {previousEntry && trend !== "same" && (
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        alignItems: 'center',
                                                                        gap: 4,
                                                                        marginTop: 4,
                                                                        backgroundColor: trend === "down" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                        paddingHorizontal: 8,
                                                                        paddingVertical: 2,
                                                                        borderRadius: 10,
                                                                    }}>
                                                                        {trend === "down" ? (
                                                                            <ArrowDown size={12} color="#10b981" strokeWidth={3} />
                                                                        ) : (
                                                                            <ArrowUp size={12} color="#ef4444" strokeWidth={3} />
                                                                        )}
                                                                        <Text style={{
                                                                            fontSize: 12,
                                                                            fontWeight: '600',
                                                                            color: trend === "down" ? '#10b981' : '#ef4444',
                                                                        }}>
                                                                            {diff.toFixed(1)}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                            <ChevronRight size={24} color={isDark ? '#71717a' : '#a1a1aa'} />
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            </Card>
                                        );
                                    }}
                                />
                            )}
                        </View>
                    )}
                </ScrollView>

                {/* Floating Add Button */}
                <TouchableOpacity
                    onPress={() => router.push("/add-tracker")}
                    activeOpacity={0.9}
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        right: 24,
                        width: 64,
                        height: 64,
                        backgroundColor: '#6366f1',
                        borderRadius: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#4f46e5',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        elevation: 10,
                    }}
                >
                    <Plus size={32} color="#ffffff" strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Settings Modal */}
                {showSettings && (
                    <View className="absolute inset-0 z-50 justify-end">
                        <TouchableOpacity
                            className="absolute inset-0"
                            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                            onPress={() => setShowSettings(false)}
                            activeOpacity={1}
                        />
                        <View className="bg-white dark:bg-zinc-900 rounded-t-3xl p-8 pb-12 shadow-2xl">
                            <View className="w-14 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-8" />
                            <View className="flex-row items-center justify-between mb-8">
                                <Text className="text-zinc-950 dark:text-zinc-50 text-2xl font-bold">Settings</Text>
                                <IconButton
                                    onPress={() => setShowSettings(false)}
                                    className="w-11 h-11"
                                    variant="ghost"
                                >
                                    <X size={20} color={isDark ? '#a1a1aa' : '#71717a'} />
                                </IconButton>
                            </View>

                            {/* Dark Mode Toggle */}
                            <Card variant="elevated" contentClassName="py-4 px-5">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-4">
                                        <View className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 items-center justify-center">
                                            {isDark ? (
                                                <Moon size={24} color="#6366f1" fill="#6366f1" />
                                            ) : (
                                                <Sun size={24} color="#6366f1" />
                                            )}
                                        </View>
                                        <View>
                                            <Text className="text-zinc-950 dark:text-zinc-50 font-semibold text-lg">Dark Mode</Text>
                                            <Text className="text-zinc-500 dark:text-zinc-400 text-sm">
                                                {isDark ? "On" : "Off"}
                                            </Text>
                                        </View>
                                    </View>
                                    <Switch
                                        value={isDark}
                                        onValueChange={(value) => setColorScheme(value ? 'dark' : 'light')}
                                        trackColor={{ false: "#e4e4e7", true: "#6366f1" }}
                                        thumbColor="#ffffff"
                                    />
                                </View>
                            </Card>

                            {/* Data Management Section */}
                            <Text className="text-zinc-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wider mt-6 mb-3 px-1">Data Management</Text>

                            {/* Export Data */}
                            <Card variant="elevated" contentClassName="py-4 px-5">
                                <TouchableOpacity
                                    onPress={handleExport}
                                    activeOpacity={0.7}
                                    className="flex-row items-center gap-4"
                                >
                                    <View className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 items-center justify-center">
                                        <Download size={24} color="#10b981" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-zinc-950 dark:text-zinc-50 font-semibold text-lg">Export Data</Text>
                                        <Text className="text-zinc-500 dark:text-zinc-400 text-sm">Download backup as JSON</Text>
                                    </View>
                                    <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
                                </TouchableOpacity>
                            </Card>

                            {/* Import Data */}
                            <Card variant="elevated" contentClassName="py-4 px-5 mt-3">
                                <TouchableOpacity
                                    onPress={handleImport}
                                    activeOpacity={0.7}
                                    className="flex-row items-center gap-4"
                                    disabled={importing}
                                >
                                    <View className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 items-center justify-center">
                                        {importing ? (
                                            <ActivityIndicator size="small" color="#f59e0b" />
                                        ) : (
                                            <Upload size={24} color="#f59e0b" />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-zinc-950 dark:text-zinc-50 font-semibold text-lg">Import Data</Text>
                                        <Text className="text-zinc-500 dark:text-zinc-400 text-sm">Restore from JSON backup</Text>
                                    </View>
                                    <ChevronRight size={20} color={isDark ? '#71717a' : '#a1a1aa'} />
                                </TouchableOpacity>
                            </Card>

                            {/* Hidden file input for web */}
                            {Platform.OS === 'web' && (
                                <input
                                    ref={fileInputRef as any}
                                    type="file"
                                    accept=".json,application/json"
                                    onChange={handleFileSelect as any}
                                    style={{ display: 'none' }}
                                />
                            )}

                            <TouchableOpacity
                                onPress={() => setShowSettings(false)}
                                activeOpacity={0.8}
                                style={{
                                    marginTop: 32,
                                    paddingVertical: 18,
                                    borderRadius: 16,
                                    backgroundColor: '#6366f1',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 18 }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Import Modal for Native */}
                {showImportModal && (
                    <View className="absolute inset-0 z-50 justify-center items-center">
                        <TouchableOpacity
                            className="absolute inset-0"
                            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                            onPress={() => setShowImportModal(false)}
                            activeOpacity={1}
                        />
                        <View className="bg-white dark:bg-zinc-900 rounded-2xl p-6 mx-6 w-full max-w-md shadow-2xl">
                            <Text className="text-zinc-950 dark:text-zinc-50 text-xl font-bold mb-4">Import Data</Text>
                            <Text className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">Paste your JSON backup data below:</Text>
                            <TextInput
                                value={importText}
                                onChangeText={setImportText}
                                multiline
                                numberOfLines={6}
                                placeholder='{"goals": [], "measurements": []}'
                                placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                                className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-zinc-950 dark:text-zinc-50 text-sm mb-4"
                                style={{ minHeight: 120, textAlignVertical: 'top' }}
                            />
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowImportModal(false);
                                        setImportText("");
                                    }}
                                    activeOpacity={0.8}
                                    className="flex-1 py-4 rounded-xl bg-zinc-200 dark:bg-zinc-700 items-center"
                                >
                                    <Text className="text-zinc-700 dark:text-zinc-300 font-semibold">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleImportFromText}
                                    activeOpacity={0.8}
                                    disabled={importing}
                                    className="flex-1 py-4 rounded-xl bg-indigo-500 items-center"
                                >
                                    {importing ? (
                                        <ActivityIndicator size="small" color="#ffffff" />
                                    ) : (
                                        <Text className="text-white font-semibold">Import</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}
