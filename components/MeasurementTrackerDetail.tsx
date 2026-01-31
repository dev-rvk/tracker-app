import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { useTrackers } from "@/context/TrackerContext";
import { cn } from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Alert, Dimensions, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Circle, Line, Path, Svg, Text as SvgText } from "react-native-svg";

interface MeasurementTrackerDetailProps {
    trackerId: string;
}

type TimeRange = "week" | "month" | "3months" | "all";
const timeRanges = [
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "3months", label: "3M" },
    { value: "all", label: "All" },
];

export function MeasurementTrackerDetail({ trackerId }: MeasurementTrackerDetailProps) {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const { getMeasurementTracker, addMeasurementEntry, deleteMeasurementTracker } = useTrackers();
    const isDark = colorScheme === "dark";
    const [selectedRange, setSelectedRange] = useState<TimeRange>("week");
    const [newValue, setNewValue] = useState("");
    const [saving, setSaving] = useState(false);

    const tracker = getMeasurementTracker(trackerId);

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

    const handleAddEntry = async () => {
        const value = parseFloat(newValue);
        if (isNaN(value)) {
            Alert.alert("Error", "Please enter a valid number");
            return;
        }

        setSaving(true);
        try {
            await addMeasurementEntry(trackerId, value);
            setNewValue("");
        } catch (error) {
            Alert.alert("Error", "Failed to add entry");
        } finally {
            setSaving(false);
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
                        await deleteMeasurementTracker(trackerId);
                        router.back();
                    },
                },
            ]
        );
    };

    // Filter data based on selected range
    const getFilteredData = () => {
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        const cutoffs: Record<TimeRange, number> = {
            week: now - 7 * day,
            month: now - 30 * day,
            "3months": now - 90 * day,
            all: 0,
        };

        return tracker.entries
            .filter(e => e.date >= cutoffs[selectedRange])
            .sort((a, b) => a.date - b.date);
    };

    const chartData = getFilteredData();
    const latestEntry = tracker.entries[tracker.entries.length - 1];
    const previousEntry = tracker.entries[tracker.entries.length - 2];
    const currentValue = latestEntry?.value ?? 0;
    const previousValue = previousEntry?.value ?? currentValue;
    const firstEntry = tracker.entries[0];
    const startValue = firstEntry?.value ?? currentValue;

    const totalChange = currentValue - startValue;
    const isPositiveTrend = totalChange < 0; // Assuming lower is better (e.g., weight)

    // Chart dimensions
    const screenWidth = Dimensions.get("window").width;
    const chartWidth = screenWidth - 100;
    const chartHeight = 200;
    const paddingTop = 30;
    const paddingBottom = 40;
    const paddingLeft = 45;
    const paddingRight = 20;
    const graphWidth = chartWidth - paddingLeft - paddingRight;
    const graphHeight = chartHeight - paddingTop - paddingBottom;

    // Calculate min/max for Y axis
    const values = chartData.map(d => d.value);
    const minVal = values.length > 0 ? Math.floor(Math.min(...values) - 1) : 0;
    const maxVal = values.length > 0 ? Math.ceil(Math.max(...values) + 1) : 100;
    const valueRange = maxVal - minVal || 1;

    // Y-axis labels
    const yAxisLabels = [];
    const yAxisSteps = 4;
    for (let i = 0; i <= yAxisSteps; i++) {
        const value = minVal + (valueRange / yAxisSteps) * i;
        yAxisLabels.push(value.toFixed(1));
    }

    // Helper functions
    const getX = (index: number) => {
        if (chartData.length <= 1) return paddingLeft + graphWidth / 2;
        return paddingLeft + (index / (chartData.length - 1)) * graphWidth;
    };

    const getY = (val: number) => {
        return chartHeight - paddingBottom - ((val - minVal) / valueRange) * graphHeight;
    };

    // Create path
    let pathD = "";
    let areaD = "";
    if (chartData.length > 0) {
        pathD = `M ${getX(0)} ${getY(chartData[0].value)} ` +
            chartData.slice(1).map((d, i) => `L ${getX(i + 1)} ${getY(d.value)}`).join(" ");
        areaD = `${pathD} L ${getX(chartData.length - 1)} ${chartHeight - paddingBottom} L ${getX(0)} ${chartHeight - paddingBottom} Z`;
    }

    // Format date for X-axis
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // Get stats
    const allValues = tracker.entries.map(e => e.value);
    const lowestValue = allValues.length > 0 ? Math.min(...allValues) : 0;
    const highestValue = allValues.length > 0 ? Math.max(...allValues) : 0;

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
                            <Text className="text-muted-foreground text-base mt-0.5">Tracking in {tracker.unit}</Text>
                        </View>
                        <IconButton onPress={handleDelete} className="w-12 h-12" variant="ghost">
                            <Trash2 size={22} className="text-destructive" />
                        </IconButton>
                    </View>

                    {/* Add Entry */}
                    <Card className="mb-5" variant="elevated" contentClassName="p-5">
                        <Text className="text-foreground text-lg font-semibold mb-4">Add Entry</Text>
                        <View className="flex-row gap-3">
                            <TextInput
                                value={newValue}
                                onChangeText={setNewValue}
                                keyboardType="numeric"
                                placeholder={`Enter ${tracker.unit}...`}
                                placeholderTextColor="#a1a1aa"
                                className="flex-1 bg-muted rounded-xl px-5 py-4 text-foreground text-base"
                            />
                            <TouchableOpacity
                                onPress={handleAddEntry}
                                disabled={saving}
                                activeOpacity={0.8}
                                style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', opacity: saving ? 0.5 : 1 }}
                            >
                                <Plus size={24} color="#ffffff" />
                            </TouchableOpacity>
                        </View>
                    </Card>

                    {/* Current Value */}
                    <Card className="mb-5" variant="elevated" contentClassName="p-6">
                        <Text className="text-foreground text-lg font-semibold mb-4">Current Progress</Text>
                        <View className="flex-row items-start justify-between">
                            <View>
                                <Text className="text-muted-foreground text-sm mb-1">Current</Text>
                                <Text className="text-foreground text-5xl font-bold">
                                    {currentValue}
                                    <Text className="text-muted-foreground text-xl font-normal"> {tracker.unit}</Text>
                                </Text>
                            </View>
                            {tracker.entries.length > 1 && (
                                <View className={cn(
                                    "flex-row items-center gap-2 px-3 py-1.5 rounded-full",
                                    isPositiveTrend ? "bg-accent/10" : "bg-destructive/10"
                                )}>
                                    {isPositiveTrend ? (
                                        <TrendingDown size={18} className="text-accent" />
                                    ) : (
                                        <TrendingUp size={18} className="text-destructive" />
                                    )}
                                    <Text className={cn(
                                        "text-base font-semibold",
                                        isPositiveTrend ? "text-accent" : "text-destructive"
                                    )}>{Math.abs(totalChange).toFixed(1)} {tracker.unit}</Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row justify-between mt-6 pt-5 border-t border-border">
                            <View>
                                <Text className="text-muted-foreground text-xs uppercase font-semibold mb-1">Start</Text>
                                <Text className="text-foreground text-lg font-semibold">{startValue.toFixed(1)}</Text>
                            </View>
                            <View>
                                <Text className="text-muted-foreground text-xs uppercase font-semibold mb-1">Lowest</Text>
                                <Text className="text-accent text-lg font-semibold">{lowestValue.toFixed(1)}</Text>
                            </View>
                            <View>
                                <Text className="text-muted-foreground text-xs uppercase font-semibold mb-1">Highest</Text>
                                <Text className="text-foreground text-lg font-semibold">{highestValue.toFixed(1)}</Text>
                            </View>
                        </View>
                    </Card>

                    {/* Chart */}
                    <Card variant="elevated" contentClassName="p-0">
                        <View className="p-5 pb-0">
                            <Text className="text-foreground text-lg font-semibold mb-5">Trends</Text>
                            <View className="flex-row gap-2 mb-5" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', padding: 6, borderRadius: 12 }}>
                                {timeRanges.map(r => (
                                    <TouchableOpacity
                                        key={r.value}
                                        onPress={() => setSelectedRange(r.value as TimeRange)}
                                        activeOpacity={0.7}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 10,
                                            borderRadius: 8,
                                            alignItems: 'center',
                                            backgroundColor: selectedRange === r.value
                                                ? (isDark ? '#18181b' : '#ffffff')
                                                : 'transparent'
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 13,
                                            fontWeight: '600',
                                            color: selectedRange === r.value
                                                ? (isDark ? '#ffffff' : '#09090b')
                                                : (isDark ? '#a1a1aa' : '#71717a')
                                        }}>{r.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="items-center overflow-hidden px-2 pb-3">
                            {chartData.length > 0 ? (
                                <Svg width={chartWidth} height={chartHeight}>
                                    {/* Y-axis lines */}
                                    {yAxisLabels.map((label, i) => {
                                        const y = chartHeight - paddingBottom - (i / yAxisSteps) * graphHeight;
                                        return (
                                            <React.Fragment key={i}>
                                                <Line
                                                    x1={paddingLeft}
                                                    y1={y}
                                                    x2={chartWidth - paddingRight}
                                                    y2={y}
                                                    stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
                                                    strokeWidth={1}
                                                />
                                                <SvgText
                                                    x={paddingLeft - 8}
                                                    y={y + 4}
                                                    fontSize="11"
                                                    fill={isDark ? "#a1a1aa" : "#71717a"}
                                                    textAnchor="end"
                                                    fontWeight="500"
                                                >
                                                    {label}
                                                </SvgText>
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* Area fill */}
                                    <Path d={areaD} fill={isDark ? "rgba(99, 102, 241, 0.15)" : "rgba(79, 70, 229, 0.08)"} />

                                    {/* Line */}
                                    <Path d={pathD} fill="none" stroke={isDark ? "#818cf8" : "#6366f1"} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

                                    {/* Data points */}
                                    {chartData.map((d, i) => (
                                        <Circle
                                            key={i}
                                            cx={getX(i)}
                                            cy={getY(d.value)}
                                            r={5}
                                            fill={isDark ? "#818cf8" : "#6366f1"}
                                            stroke={isDark ? "#09090b" : "#ffffff"}
                                            strokeWidth={2}
                                        />
                                    ))}

                                    {/* X-axis labels */}
                                    {chartData.length <= 7 ? (
                                        chartData.map((d, i) => (
                                            <SvgText
                                                key={i}
                                                x={getX(i)}
                                                y={chartHeight - 10}
                                                fontSize="10"
                                                fill={isDark ? "#a1a1aa" : "#71717a"}
                                                textAnchor="middle"
                                                fontWeight="500"
                                            >
                                                {formatDate(d.date)}
                                            </SvgText>
                                        ))
                                    ) : (
                                        // Show only first, middle, and last for many data points
                                        [0, Math.floor(chartData.length / 2), chartData.length - 1].map(i => (
                                            <SvgText
                                                key={i}
                                                x={getX(i)}
                                                y={chartHeight - 10}
                                                fontSize="10"
                                                fill={isDark ? "#a1a1aa" : "#71717a"}
                                                textAnchor="middle"
                                                fontWeight="500"
                                            >
                                                {formatDate(chartData[i].date)}
                                            </SvgText>
                                        ))
                                    )}
                                </Svg>
                            ) : (
                                <View className="py-12 items-center">
                                    <Text className="text-muted-foreground text-base">No data for this period</Text>
                                </View>
                            )}
                        </View>

                        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                            <Text style={{ color: isDark ? '#a1a1aa' : '#71717a', fontSize: 13 }}>
                                {selectedRange === "week" ? "Last 7 days" :
                                    selectedRange === "month" ? "Last 30 days" :
                                        selectedRange === "3months" ? "Last 90 days" : "All time"}
                            </Text>
                            <Text style={{ color: isDark ? '#ffffff' : '#09090b', fontWeight: '600', fontSize: 13 }}>{chartData.length} entries</Text>
                        </View>
                    </Card>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
