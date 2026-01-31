import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { useTrackers } from "@/context/TrackerContext";
import { cn } from "@/lib/utils";
import { Task } from "@/types/tracker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Plus, Target, TrendingUp, X } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StatusBar, Text, TextInput, View } from "react-native";

type TrackerType = "goal" | "measurement" | null;
type Frequency = "daily" | "weekly" | "monthly";
type Unit = "kg" | "cm" | "lbs" | "custom";

const predefinedTags = [
    { name: "Health", color: "bg-tag-health" },
    { name: "Academic", color: "bg-tag-academic" },
    { name: "Fitness", color: "bg-tag-fitness" },
    { name: "Work", color: "bg-tag-work" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AddTracker() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const { addGoalTracker, addMeasurementTracker } = useTrackers();
    const isDark = colorScheme === "dark";
    const [selectedType, setSelectedType] = useState<TrackerType>(null);
    const [saving, setSaving] = useState(false);

    // Goal state
    const [goalName, setGoalName] = useState("");
    const [selectedFrequency, setSelectedFrequency] = useState<Frequency>("daily");
    const [selectedTag, setSelectedTag] = useState(predefinedTags[0]);
    const [tasks, setTasks] = useState<string[]>([]);
    const [newTask, setNewTask] = useState("");
    const [customTags, setCustomTags] = useState<{ name: string; color: string }[]>([]);
    const [showAddTag, setShowAddTag] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [startDay, setStartDay] = useState("Mon");

    // Measurement state
    const [measurementName, setMeasurementName] = useState("");
    const [selectedUnit, setSelectedUnit] = useState<Unit>("kg");
    const [customUnit, setCustomUnit] = useState("");

    const allTags = [...predefinedTags, ...customTags];

    const gradientColors = isDark
        ? ["#09090b", "#18181b"] as const
        : ["#f8fafc", "#f1f5f9"] as const;

    const handleAddTask = () => {
        if (newTask.trim()) {
            setTasks([...tasks, newTask.trim()]);
            setNewTask("");
        }
    };

    const handleRemoveTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const handleAddCustomTag = () => {
        if (newTagName.trim()) {
            const newTag = { name: newTagName.trim(), color: "bg-primary" };
            setCustomTags([...customTags, newTag]);
            setSelectedTag(newTag);
            setNewTagName("");
            setShowAddTag(false);
        }
    };

    const handleBack = () => {
        if (selectedType) setSelectedType(null);
        else router.back();
    };

    const handleCreateGoal = async () => {
        if (!goalName.trim()) {
            Alert.alert("Error", "Please enter a tracker name");
            return;
        }
        if (tasks.length === 0) {
            Alert.alert("Error", "Please add at least one task");
            return;
        }

        setSaving(true);
        try {
            const taskObjects: Task[] = tasks.map((name, i) => ({
                id: `task-${Date.now()}-${i}`,
                name,
                completed: false,
            }));

            await addGoalTracker({
                name: goalName.trim(),
                tag: selectedTag.name,
                tagColor: selectedTag.color,
                frequency: selectedFrequency,
                tasks: taskObjects,
                startDay: selectedFrequency === "weekly" ? startDay : undefined,
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

    return (
        <View className="flex-1">
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <LinearGradient colors={gradientColors} className="absolute inset-0" start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
            <SafeAreaView className="flex-1">
                <ScrollView contentContainerStyle={{ paddingBottom: 50 }} className="px-6 py-8">
                    {/* Header */}
                    <View className="flex-row items-center gap-4 mb-8 pt-2">
                        <IconButton onPress={handleBack} className="w-12 h-12" variant="ghost">
                            <ArrowLeft size={24} className="text-foreground" />
                        </IconButton>
                        <View>
                            <Text className="text-foreground text-3xl font-bold">Add Tracker</Text>
                            <Text className="text-muted-foreground text-base mt-0.5">
                                {!selectedType ? "Choose tracker type" : "Configure your tracker"}
                            </Text>
                        </View>
                    </View>

                    {/* Type Selection */}
                    {!selectedType && (
                        <View className="gap-4">
                            <Pressable onPress={() => setSelectedType("goal")}>
                                <Card variant="elevated" contentClassName="p-6">
                                    <View className="flex-row items-start gap-5">
                                        <View className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center">
                                            <Target size={28} className="text-primary" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-foreground text-xl font-semibold">Goal Tracker</Text>
                                            <Text className="text-muted-foreground text-base mt-1.5 leading-6">
                                                Track tasks and habits with daily, weekly, or monthly goals.
                                            </Text>
                                            <View className="flex-row flex-wrap gap-2 mt-4">
                                                {["Checkboxes", "Tags", "Progress"].map(f => (
                                                    <View key={f} className="px-3 py-1 rounded-lg bg-muted">
                                                        <Text className="text-muted-foreground text-xs font-semibold uppercase">{f}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </Card>
                            </Pressable>

                            <Pressable onPress={() => setSelectedType("measurement")}>
                                <Card variant="elevated" contentClassName="p-6">
                                    <View className="flex-row items-start gap-5">
                                        <View className="w-14 h-14 rounded-2xl bg-accent/10 items-center justify-center">
                                            <TrendingUp size={28} className="text-accent" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-foreground text-xl font-semibold">Measurement Tracker</Text>
                                            <Text className="text-muted-foreground text-base mt-1.5 leading-6">
                                                Track physical quantities over time with beautiful charts.
                                            </Text>
                                            <View className="flex-row flex-wrap gap-2 mt-4">
                                                {["Charts", "Trends", "Units"].map(f => (
                                                    <View key={f} className="px-3 py-1 rounded-lg bg-muted">
                                                        <Text className="text-muted-foreground text-xs font-semibold uppercase">{f}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </Card>
                            </Pressable>
                        </View>
                    )}

                    {/* Goal Configuration */}
                    {selectedType === "goal" && (
                        <View className="gap-5">
                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-foreground text-base font-semibold mb-3">Tracker Name</Text>
                                <TextInput
                                    value={goalName}
                                    onChangeText={setGoalName}
                                    placeholder="e.g., Daily Steps"
                                    placeholderTextColor="#a1a1aa"
                                    className="bg-muted rounded-xl px-5 py-4 text-foreground text-base"
                                />
                            </Card>

                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-foreground text-base font-semibold mb-4">Frequency</Text>
                                <View className="flex-row gap-3">
                                    {(["daily", "weekly", "monthly"] as Frequency[]).map(freq => (
                                        <Pressable
                                            key={freq}
                                            onPress={() => setSelectedFrequency(freq)}
                                            className={cn(
                                                "flex-1 py-3.5 rounded-xl items-center",
                                                selectedFrequency === freq ? "bg-primary" : "bg-muted"
                                            )}
                                        >
                                            <Text className={cn(
                                                "text-base font-semibold capitalize",
                                                selectedFrequency === freq ? "text-primary-foreground" : "text-muted-foreground"
                                            )}>{freq}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </Card>

                            {selectedFrequency === "weekly" && (
                                <Card variant="elevated" contentClassName="p-5">
                                    <Text className="text-foreground text-base font-semibold mb-4">Week Starts On</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {weekDays.map(day => (
                                            <Pressable
                                                key={day}
                                                onPress={() => setStartDay(day)}
                                                className={cn(
                                                    "px-4 py-2.5 rounded-xl",
                                                    startDay === day ? "bg-primary" : "bg-muted"
                                                )}
                                            >
                                                <Text className={cn(
                                                    "text-sm font-semibold",
                                                    startDay === day ? "text-primary-foreground" : "text-muted-foreground"
                                                )}>{day}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </Card>
                            )}

                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-foreground text-base font-semibold mb-4">Tag</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {allTags.map(tag => (
                                        <Pressable
                                            key={tag.name}
                                            onPress={() => setSelectedTag(tag)}
                                            className={cn(
                                                "px-4 py-2 rounded-full flex-row items-center gap-2",
                                                selectedTag.name === tag.name ? tag.color : "bg-muted"
                                            )}
                                        >
                                            {selectedTag.name === tag.name && <Check size={16} className="text-white" />}
                                            <Text className={cn(
                                                "text-sm font-semibold",
                                                selectedTag.name === tag.name ? "text-white" : "text-muted-foreground"
                                            )}>{tag.name}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                                {!showAddTag ? (
                                    <Pressable onPress={() => setShowAddTag(true)} className="flex-row items-center gap-2 mt-4">
                                        <Plus size={18} className="text-primary" />
                                        <Text className="text-primary text-base font-medium">Add Custom Tag</Text>
                                    </Pressable>
                                ) : (
                                    <View className="flex-row gap-3 mt-4">
                                        <TextInput
                                            value={newTagName}
                                            onChangeText={setNewTagName}
                                            placeholder="Tag name"
                                            placeholderTextColor="#a1a1aa"
                                            className="flex-1 bg-muted rounded-xl px-4 py-3 text-base text-foreground"
                                            autoFocus
                                        />
                                        <Pressable onPress={handleAddCustomTag} className="px-4 py-3 bg-primary rounded-xl">
                                            <Text className="text-primary-foreground text-base font-medium">Add</Text>
                                        </Pressable>
                                        <Pressable onPress={() => { setShowAddTag(false); setNewTagName(""); }} className="w-12 h-12 bg-muted rounded-xl items-center justify-center">
                                            <X size={18} className="text-muted-foreground" />
                                        </Pressable>
                                    </View>
                                )}
                            </Card>

                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-foreground text-base font-semibold mb-4">Tasks</Text>
                                <View className="flex-row gap-3 mb-4">
                                    <TextInput
                                        value={newTask}
                                        onChangeText={setNewTask}
                                        onSubmitEditing={handleAddTask}
                                        placeholder="Add a task..."
                                        placeholderTextColor="#a1a1aa"
                                        className="flex-1 bg-muted rounded-xl px-5 py-4 text-foreground text-base"
                                    />
                                    <Pressable onPress={handleAddTask} className="w-14 h-14 bg-primary rounded-xl items-center justify-center">
                                        <Plus size={24} className="text-primary-foreground" />
                                    </Pressable>
                                </View>
                                {tasks.length > 0 ? (
                                    <View className="gap-2">
                                        {tasks.map((task, i) => (
                                            <View key={`${task}-${i}`} className="flex-row items-center justify-between bg-muted rounded-xl px-5 py-4">
                                                <Text className="text-foreground text-base flex-1">{task}</Text>
                                                <Pressable onPress={() => handleRemoveTask(i)} className="w-8 h-8 rounded-full bg-destructive/10 items-center justify-center ml-3">
                                                    <X size={14} className="text-destructive" />
                                                </Pressable>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View className="py-6 rounded-xl bg-muted/50 border border-dashed border-border">
                                        <Text className="text-muted-foreground text-base text-center">No tasks added yet</Text>
                                    </View>
                                )}
                            </Card>

                            <Pressable
                                onPress={handleCreateGoal}
                                disabled={saving}
                                className={cn("bg-primary py-5 rounded-2xl items-center mt-2", saving && "opacity-50")}
                            >
                                <Text className="text-primary-foreground font-semibold text-lg">
                                    {saving ? "Creating..." : "Create Goal Tracker"}
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Measurement Configuration */}
                    {selectedType === "measurement" && (
                        <View className="gap-5">
                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-foreground text-base font-semibold mb-3">What to track?</Text>
                                <TextInput
                                    value={measurementName}
                                    onChangeText={setMeasurementName}
                                    placeholder="e.g., Weight, Blood Pressure"
                                    placeholderTextColor="#a1a1aa"
                                    className="bg-muted rounded-xl px-5 py-4 text-foreground text-base"
                                />
                            </Card>

                            <Card variant="elevated" contentClassName="p-5">
                                <Text className="text-foreground text-base font-semibold mb-4">Unit</Text>
                                <View className="flex-row flex-wrap gap-3">
                                    {[
                                        { value: "kg", label: "kg" },
                                        { value: "lbs", label: "lbs" },
                                        { value: "cm", label: "cm" },
                                        { value: "custom", label: "Custom" },
                                    ].map(u => (
                                        <Pressable
                                            key={u.value}
                                            onPress={() => setSelectedUnit(u.value as Unit)}
                                            className={cn(
                                                "flex-1 py-3.5 rounded-xl items-center min-w-[80px]",
                                                selectedUnit === u.value ? "bg-primary" : "bg-muted"
                                            )}
                                        >
                                            <Text className={cn(
                                                "text-base font-semibold",
                                                selectedUnit === u.value ? "text-primary-foreground" : "text-muted-foreground"
                                            )}>{u.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                                {selectedUnit === "custom" && (
                                    <TextInput
                                        value={customUnit}
                                        onChangeText={setCustomUnit}
                                        placeholder="Enter unit..."
                                        placeholderTextColor="#a1a1aa"
                                        className="mt-4 bg-muted rounded-xl px-5 py-4 text-foreground text-base"
                                    />
                                )}
                            </Card>

                            <Card variant="outlined" className="border-primary/20 bg-primary/5" contentClassName="p-5">
                                <View className="flex-row items-start gap-4">
                                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                                        <TrendingUp size={22} className="text-primary" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-foreground text-base font-semibold">How it works</Text>
                                        <Text className="text-muted-foreground text-base mt-1.5 leading-6">
                                            Enter measurements anytime. View trends as beautiful charts over time.
                                        </Text>
                                    </View>
                                </View>
                            </Card>

                            <Pressable
                                onPress={handleCreateMeasurement}
                                disabled={saving}
                                className={cn("bg-primary py-5 rounded-2xl items-center mt-2", saving && "opacity-50")}
                            >
                                <Text className="text-primary-foreground font-semibold text-lg">
                                    {saving ? "Creating..." : "Create Measurement Tracker"}
                                </Text>
                            </Pressable>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
