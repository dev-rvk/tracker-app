import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { useTrackers } from "@/context/TrackerContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Minus, Plus, Target, TrendingUp } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";

type TrackerType = "goal" | "measurement" | null;
type Period = "daily" | "weekly" | "monthly";
type Unit = "kg" | "cm" | "lbs" | "custom";

const predefinedTags = [
    { name: "Health", color: "bg-tag-health" },
    { name: "Academic", color: "bg-tag-academic" },
    { name: "Fitness", color: "bg-tag-fitness" },
    { name: "Work", color: "bg-tag-work" },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthDates = Array.from({ length: 28 }, (_, i) => i + 1);

export function AddTracker() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const { addGoalTracker, addMeasurementTracker } = useTrackers();
    const isDark = colorScheme === "dark";
    const [selectedType, setSelectedType] = useState<TrackerType>(null);
    const [saving, setSaving] = useState(false);

    // Goal state
    const [goalName, setGoalName] = useState("");
    const [frequency, setFrequency] = useState(1);
    const [period, setPeriod] = useState<Period>("daily");
    const [selectedTag, setSelectedTag] = useState<{ name: string; color: string } | null>(null);
    const [startDay, setStartDay] = useState("Mon");
    const [startDate, setStartDate] = useState(1);

    // Measurement state
    const [measurementName, setMeasurementName] = useState("");
    const [selectedUnit, setSelectedUnit] = useState<Unit>("kg");
    const [customUnit, setCustomUnit] = useState("");

    const gradientColors = isDark
        ? ["#09090b", "#18181b"] as const
        : ["#f8fafc", "#f1f5f9"] as const;

    const getMaxFrequency = () => {
        switch (period) {
            case "daily": return 10;
            case "weekly": return 7;
            case "monthly": return 31;
        }
    };

    const handleBack = () => {
        if (selectedType) setSelectedType(null);
        else router.back();
    };

    const handleFrequencyChange = (delta: number) => {
        const newVal = frequency + delta;
        if (newVal >= 1 && newVal <= getMaxFrequency()) {
            setFrequency(newVal);
        }
    };

    const handlePeriodChange = (newPeriod: Period) => {
        setPeriod(newPeriod);
        // Reset frequency if it exceeds new max
        const maxFreq = newPeriod === "daily" ? 10 : newPeriod === "weekly" ? 7 : 31;
        if (frequency > maxFreq) {
            setFrequency(maxFreq);
        }
    };

    const handleCreateGoal = async () => {
        if (!goalName.trim()) {
            Alert.alert("Error", "Please enter a goal name");
            return;
        }
        if (!selectedTag) {
            Alert.alert("Error", "Please select a tag");
            return;
        }

        setSaving(true);
        try {
            await addGoalTracker({
                name: goalName.trim(),
                tag: selectedTag.name,
                tagColor: selectedTag.color,
                frequency,
                period,
                startDay,
                startDate: period === "monthly" ? startDate : undefined,
            });

            router.replace("/");
        } catch (error) {
            Alert.alert("Error", "Failed to create tracker");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateMeasurement = async () => {
        if (!measurementName.trim()) {
            Alert.alert("Error", "Please enter a tracker name");
            return;
        }

        const unit = selectedUnit === "custom" ? customUnit.trim() || "units" : selectedUnit;

        setSaving(true);
        try {
            await addMeasurementTracker({
                name: measurementName.trim(),
                unit,
            });

            router.replace("/");
        } catch (error) {
            Alert.alert("Error", "Failed to create tracker");
        } finally {
            setSaving(false);
        }
    };

    const getFrequencyLabel = () => {
        switch (period) {
            case "daily": return "times / day";
            case "weekly": return "times / week";
            case "monthly": return "times / month";
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
                        <IconButton onPress={handleBack} className="w-12 h-12" variant="ghost">
                            <ArrowLeft size={24} color={isDark ? '#ffffff' : '#09090b'} />
                        </IconButton>
                        <View>
                            <Text className="text-zinc-950 dark:text-zinc-50 text-3xl font-bold">Add Tracker</Text>
                            <Text className="text-zinc-500 dark:text-zinc-400 text-base mt-0.5">
                                {!selectedType ? "Choose tracker type" : "Configure your tracker"}
                            </Text>
                        </View>
                    </View>

                    {/* Type Selection */}
                    {!selectedType && (
                        <View className="gap-4">
                            <TouchableOpacity onPress={() => setSelectedType("goal")} activeOpacity={0.8}>
                                <Card variant="elevated" contentClassName="p-6">
                                    <View className="flex-row items-start gap-5">
                                        <View className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 items-center justify-center">
                                            <Target size={28} color="#6366f1" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-zinc-950 dark:text-zinc-50 text-xl font-semibold">Goal Tracker</Text>
                                            <Text className="text-zinc-500 dark:text-zinc-400 text-base mt-1.5 leading-6">
                                                Track habits with frequency goals like "Gym 3x/week"
                                            </Text>
                                            <View className="flex-row flex-wrap gap-2 mt-4">
                                                {["Daily", "Weekly", "Monthly"].map(f => (
                                                    <View key={f} className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                                        <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase">{f}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </Card>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setSelectedType("measurement")} activeOpacity={0.8}>
                                <Card variant="elevated" contentClassName="p-6">
                                    <View className="flex-row items-start gap-5">
                                        <View className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 items-center justify-center">
                                            <TrendingUp size={28} color="#10b981" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-zinc-950 dark:text-zinc-50 text-xl font-semibold">Metric Tracker</Text>
                                            <Text className="text-zinc-500 dark:text-zinc-400 text-base mt-1.5 leading-6">
                                                Track physical quantities over time with beautiful charts.
                                            </Text>
                                            <View className="flex-row flex-wrap gap-2 mt-4">
                                                {["Charts", "Trends", "Units"].map(f => (
                                                    <View key={f} className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                                        <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase">{f}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Goal Configuration */}
                    {selectedType === "goal" && (
                        <View className="gap-5">
                            {/* Name */}
                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-zinc-950 dark:text-zinc-50 text-base font-semibold mb-3">Goal Name</Text>
                                <TextInput
                                    value={goalName}
                                    onChangeText={setGoalName}
                                    placeholder="e.g., Gym, Reading, Meditation"
                                    placeholderTextColor="#a1a1aa"
                                    className="rounded-xl px-5 py-4 text-base"
                                    style={{
                                        backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                                        color: isDark ? '#fafafa' : '#09090b'
                                    }}
                                />
                            </Card>

                            {/* Period */}
                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-zinc-950 dark:text-zinc-50 text-base font-semibold mb-4">Period</Text>
                                <View className="flex-row gap-3">
                                    {(["daily", "weekly", "monthly"] as Period[]).map(p => (
                                        <TouchableOpacity
                                            key={p}
                                            onPress={() => handlePeriodChange(p)}
                                            activeOpacity={0.7}
                                            style={{
                                                flex: 1,
                                                paddingVertical: 14,
                                                borderRadius: 12,
                                                alignItems: 'center',
                                                backgroundColor: period === p ? '#6366f1' : (isDark ? '#27272a' : '#f4f4f5'),
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 14,
                                                fontWeight: '600',
                                                textTransform: 'capitalize',
                                                color: period === p ? '#ffffff' : (isDark ? '#a1a1aa' : '#71717a'),
                                            }}>{p}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </Card>

                            {/* Frequency */}
                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-zinc-950 dark:text-zinc-50 text-base font-semibold mb-4">
                                    How many times?
                                </Text>
                                <View className="flex-row items-center justify-center gap-6">
                                    <TouchableOpacity
                                        onPress={() => handleFrequencyChange(-1)}
                                        disabled={frequency <= 1}
                                        activeOpacity={0.7}
                                        style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 28,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                                            opacity: frequency <= 1 ? 0.4 : 1,
                                        }}
                                    >
                                        <Minus size={24} color={isDark ? '#ffffff' : '#09090b'} />
                                    </TouchableOpacity>

                                    <View className="items-center">
                                        <Text className="text-zinc-950 dark:text-zinc-50 text-5xl font-bold">{frequency}</Text>
                                        <Text className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                                            {getFrequencyLabel()}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => handleFrequencyChange(1)}
                                        disabled={frequency >= getMaxFrequency()}
                                        activeOpacity={0.7}
                                        style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 28,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                                            opacity: frequency >= getMaxFrequency() ? 0.4 : 1,
                                        }}
                                    >
                                        <Plus size={24} color={isDark ? '#ffffff' : '#09090b'} />
                                    </TouchableOpacity>
                                </View>
                            </Card>

                            {/* Start Day (for weekly) */}
                            {period === "weekly" && (
                                <Card variant="elevated" contentClassName="p-5">
                                    <Text className="text-zinc-950 dark:text-zinc-50 text-base font-semibold mb-4">Week Starts On</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {weekDays.map(day => (
                                            <TouchableOpacity
                                                key={day}
                                                onPress={() => setStartDay(day)}
                                                activeOpacity={0.7}
                                                style={{
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 10,
                                                    borderRadius: 12,
                                                    backgroundColor: startDay === day ? '#6366f1' : (isDark ? '#27272a' : '#f4f4f5'),
                                                }}
                                            >
                                                <Text style={{
                                                    fontSize: 14,
                                                    fontWeight: '600',
                                                    color: startDay === day ? '#ffffff' : (isDark ? '#a1a1aa' : '#71717a'),
                                                }}>{day}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </Card>
                            )}

                            {/* Start Date (for monthly) */}
                            {period === "monthly" && (
                                <Card variant="elevated" contentClassName="p-5">
                                    <Text className="text-zinc-950 dark:text-zinc-50 text-base font-semibold mb-4">Month Starts On Day</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
                                    >
                                        {monthDates.map(date => (
                                            <TouchableOpacity
                                                key={date}
                                                onPress={() => setStartDate(date)}
                                                activeOpacity={0.7}
                                                style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 22,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: startDate === date ? '#6366f1' : (isDark ? '#27272a' : '#f4f4f5'),
                                                }}
                                            >
                                                <Text style={{
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                    color: startDate === date ? '#ffffff' : (isDark ? '#a1a1aa' : '#71717a'),
                                                }}>{date}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </Card>
                            )}

                            {/* Tag */}
                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-zinc-950 dark:text-zinc-50 text-base font-semibold mb-4">Tag</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {predefinedTags.map(tag => (
                                        <TouchableOpacity
                                            key={tag.name}
                                            onPress={() => setSelectedTag(selectedTag?.name === tag.name ? null : tag)}
                                            activeOpacity={0.7}
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 8,
                                                borderRadius: 20,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 6,
                                                backgroundColor: selectedTag?.name === tag.name
                                                    ? (tag.color === 'bg-tag-health' ? '#10b981' :
                                                        tag.color === 'bg-tag-academic' ? '#6366f1' :
                                                            tag.color === 'bg-tag-fitness' ? '#f59e0b' : '#db2777')
                                                    : (isDark ? '#27272a' : '#f4f4f5'),
                                            }}
                                        >
                                            {selectedTag?.name === tag.name && <Check size={14} color="#ffffff" />}
                                            <Text style={{
                                                fontSize: 14,
                                                fontWeight: '600',
                                                color: selectedTag?.name === tag.name ? '#ffffff' : (isDark ? '#a1a1aa' : '#71717a'),
                                            }}>{tag.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {!selectedTag && (
                                    <Text className="text-destructive text-sm mt-3">Please select a tag</Text>
                                )}
                            </Card>

                            {/* Preview */}
                            <Card variant="outlined" className="border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/5" contentClassName="p-5">
                                <Text className="text-zinc-950 dark:text-zinc-50 text-base font-semibold mb-3">Preview</Text>
                                <View className="flex-row items-center gap-3">
                                    <View className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 items-center justify-center">
                                        <Target size={24} color="#6366f1" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-zinc-950 dark:text-zinc-50 font-semibold text-lg">
                                            {goalName || "Goal Name"}
                                        </Text>
                                        <Text className="text-zinc-500 dark:text-zinc-400 text-sm">
                                            {frequency}x {period}
                                            {period === "weekly" && ` • Starts ${startDay}`}
                                            {period === "monthly" && ` • Starts day ${startDate}`}
                                        </Text>
                                    </View>
                                    {selectedTag && (
                                        <View style={{
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            borderRadius: 12,
                                            backgroundColor: selectedTag.color === 'bg-tag-health' ? '#10b981' :
                                                selectedTag.color === 'bg-tag-academic' ? '#6366f1' :
                                                    selectedTag.color === 'bg-tag-fitness' ? '#f59e0b' : '#db2777',
                                        }}>
                                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#ffffff' }}>
                                                {selectedTag.name}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </Card>

                            <TouchableOpacity
                                onPress={handleCreateGoal}
                                disabled={saving || !selectedTag}
                                activeOpacity={0.8}
                                style={{
                                    backgroundColor: '#6366f1',
                                    paddingVertical: 18,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    marginTop: 8,
                                    opacity: (saving || !selectedTag) ? 0.5 : 1,
                                }}
                            >
                                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 18 }}>
                                    {saving ? "Creating..." : "Create Goal Tracker"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Measurement Configuration */}
                    {selectedType === "measurement" && (
                        <View className="gap-5">
                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-zinc-950 dark:text-zinc-50 text-base font-semibold mb-3">What to track?</Text>
                                <TextInput
                                    value={measurementName}
                                    onChangeText={setMeasurementName}
                                    placeholder="e.g., Weight, Blood Pressure"
                                    placeholderTextColor="#a1a1aa"
                                    className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-5 py-4 text-zinc-950 dark:text-zinc-50 text-base"
                                />
                            </Card>

                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-zinc-950 dark:text-zinc-50 text-base font-semibold mb-4">Unit</Text>
                                <View className="flex-row flex-wrap gap-3">
                                    {[
                                        { value: "kg", label: "kg" },
                                        { value: "lbs", label: "lbs" },
                                        { value: "cm", label: "cm" },
                                        { value: "custom", label: "Custom" },
                                    ].map(u => (
                                        <TouchableOpacity
                                            key={u.value}
                                            onPress={() => setSelectedUnit(u.value as Unit)}
                                            activeOpacity={0.7}
                                            style={{
                                                flex: 1,
                                                minWidth: 70,
                                                paddingVertical: 14,
                                                borderRadius: 12,
                                                alignItems: 'center',
                                                backgroundColor: selectedUnit === u.value ? '#6366f1' : (isDark ? '#27272a' : '#f4f4f5'),
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 16,
                                                fontWeight: '600',
                                                color: selectedUnit === u.value ? '#ffffff' : (isDark ? '#a1a1aa' : '#71717a'),
                                            }}>{u.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {selectedUnit === "custom" && (
                                    <TextInput
                                        value={customUnit}
                                        onChangeText={setCustomUnit}
                                        placeholder="Enter unit..."
                                        placeholderTextColor="#a1a1aa"
                                        className="mt-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-5 py-4 text-zinc-950 dark:text-zinc-50 text-base"
                                    />
                                )}
                            </Card>

                            <Card variant="outlined" className="border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/5" contentClassName="p-5">
                                <View className="flex-row items-start gap-4">
                                    <View className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 items-center justify-center">
                                        <TrendingUp size={22} color="#6366f1" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-zinc-950 dark:text-zinc-50 text-base font-semibold">How it works</Text>
                                        <Text className="text-zinc-500 dark:text-zinc-400 text-base mt-1.5 leading-6">
                                            Enter measurements anytime. View trends as beautiful charts over time.
                                        </Text>
                                    </View>
                                </View>
                            </Card>

                            <TouchableOpacity
                                onPress={handleCreateMeasurement}
                                disabled={saving}
                                activeOpacity={0.8}
                                style={{
                                    backgroundColor: '#6366f1',
                                    paddingVertical: 18,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    marginTop: 8,
                                    opacity: saving ? 0.5 : 1,
                                }}
                            >
                                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 18 }}>
                                    {saving ? "Creating..." : "Create Metric Tracker"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
