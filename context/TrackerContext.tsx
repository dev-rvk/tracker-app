import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CompletionRecord, GoalTracker, MeasurementEntry, MeasurementTracker, TrackerStore } from "../types/tracker";

const STORAGE_KEY = "tracker_data_v2";

// Helper to get period start timestamp
const getPeriodStart = (period: "daily" | "weekly" | "monthly", startDay: string, startDate?: number): number => {
    const now = new Date();

    if (period === "daily") {
        const periodStart = new Date(now);
        periodStart.setHours(0, 0, 0, 0);
        return periodStart.getTime();
    } else if (period === "weekly") {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const targetDayIndex = dayNames.indexOf(startDay);
        const currentDayIndex = now.getDay();

        // Calculate days since the start of the week (relative to startDay)
        let daysBack = currentDayIndex - targetDayIndex;
        if (daysBack < 0) daysBack += 7;

        const periodStart = new Date(now);
        periodStart.setDate(now.getDate() - daysBack);
        periodStart.setHours(0, 0, 0, 0);
        return periodStart.getTime();
    } else {
        // Monthly
        const start = startDate || 1;
        const periodStart = new Date(now.getFullYear(), now.getMonth(), start, 0, 0, 0, 0);

        // If we're before the start date, go to previous month
        if (now.getDate() < start) {
            periodStart.setMonth(periodStart.getMonth() - 1);
        }

        return periodStart.getTime();
    }
};

// Sample data
const initialData: TrackerStore = {
    goals: [
        {
            id: "goal-1",
            name: "Gym",
            tag: "Health",
            tagColor: "bg-tag-health",
            frequency: 3,
            period: "weekly",
            startDay: "Mon",
            completions: [
                { periodStart: getPeriodStart("weekly", "Mon") - 7 * 24 * 60 * 60 * 1000, count: 3 },
                { periodStart: getPeriodStart("weekly", "Mon") - 14 * 24 * 60 * 60 * 1000, count: 2 },
                { periodStart: getPeriodStart("weekly", "Mon") - 21 * 24 * 60 * 60 * 1000, count: 3 },
                { periodStart: getPeriodStart("weekly", "Mon"), count: 1 },
            ],
            createdAt: Date.now() - 28 * 24 * 60 * 60 * 1000,
        },
        {
            id: "goal-2",
            name: "Reading",
            tag: "Academic",
            tagColor: "bg-tag-academic",
            frequency: 1,
            period: "daily",
            startDay: "Mon",
            completions: [
                { periodStart: getPeriodStart("daily", "Mon") - 24 * 60 * 60 * 1000, count: 1 },
                { periodStart: getPeriodStart("daily", "Mon") - 48 * 60 * 60 * 1000, count: 1 },
                { periodStart: getPeriodStart("daily", "Mon"), count: 0 },
            ],
            createdAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
        },
        {
            id: "goal-3",
            name: "Meditation",
            tag: "Health",
            tagColor: "bg-tag-health",
            frequency: 2,
            period: "daily",
            startDay: "Mon",
            completions: [
                { periodStart: getPeriodStart("daily", "Mon") - 24 * 60 * 60 * 1000, count: 2 },
                { periodStart: getPeriodStart("daily", "Mon"), count: 1 },
            ],
            createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
        },
    ],
    measurements: [
        {
            id: "measure-1",
            name: "Weight",
            unit: "kg",
            entries: [
                { id: "e1", value: 75.0, date: Date.now() - 28 * 24 * 60 * 60 * 1000 },
                { id: "e2", value: 74.5, date: Date.now() - 21 * 24 * 60 * 60 * 1000 },
                { id: "e3", value: 74.2, date: Date.now() - 14 * 24 * 60 * 60 * 1000 },
                { id: "e4", value: 73.5, date: Date.now() - 7 * 24 * 60 * 60 * 1000 },
                { id: "e5", value: 73.0, date: Date.now() - 3 * 24 * 60 * 60 * 1000 },
                { id: "e6", value: 72.8, date: Date.now() - 1 * 24 * 60 * 60 * 1000 },
                { id: "e7", value: 72.5, date: Date.now() },
            ],
            createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        },
        {
            id: "measure-2",
            name: "Waist",
            unit: "cm",
            entries: [
                { id: "w1", value: 86, date: Date.now() - 21 * 24 * 60 * 60 * 1000 },
                { id: "w2", value: 85, date: Date.now() - 14 * 24 * 60 * 60 * 1000 },
                { id: "w3", value: 84, date: Date.now() - 7 * 24 * 60 * 60 * 1000 },
                { id: "w4", value: 83, date: Date.now() - 2 * 24 * 60 * 60 * 1000 },
                { id: "w5", value: 82, date: Date.now() },
            ],
            createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
        },
    ],
};

interface TagStats {
    tag: string;
    tagColor: string;
    totalGoals: number;
    completedPeriods: number;
    totalPeriods: number;
    currentProgress: number;
    currentTarget: number;
}

interface TrackerContextType {
    store: TrackerStore;
    loading: boolean;
    // Goal actions
    addGoalTracker: (tracker: Omit<GoalTracker, "id" | "createdAt" | "completions">) => Promise<void>;
    updateGoalTracker: (id: string, updates: Partial<GoalTracker>) => Promise<void>;
    deleteGoalTracker: (id: string) => Promise<void>;
    incrementGoal: (trackerId: string) => Promise<void>;
    decrementGoal: (trackerId: string) => Promise<void>;
    getCurrentPeriodProgress: (trackerId: string) => { count: number; frequency: number; periodStart: number };
    getGoalHistory: (trackerId: string, limit?: number) => CompletionRecord[];
    getStatsByTag: () => TagStats[];
    // Measurement actions
    addMeasurementTracker: (tracker: Omit<MeasurementTracker, "id" | "createdAt" | "entries">) => Promise<void>;
    addMeasurementEntry: (trackerId: string, value: number) => Promise<void>;
    deleteMeasurementTracker: (id: string) => Promise<void>;
    // Util
    getGoalTracker: (id: string) => GoalTracker | undefined;
    getMeasurementTracker: (id: string) => MeasurementTracker | undefined;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
    const [store, setStore] = useState<TrackerStore>({ goals: [], measurements: [] });
    const [loading, setLoading] = useState(true);

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                setStore(JSON.parse(data));
            } else {
                // Initialize with sample data
                setStore(initialData);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            }
        } catch (error) {
            console.error("Failed to load tracker data:", error);
            setStore(initialData);
        } finally {
            setLoading(false);
        }
    };

    const saveData = async (newStore: TrackerStore) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStore));
            setStore(newStore);
        } catch (error) {
            console.error("Failed to save tracker data:", error);
        }
    };

    const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Goal Actions
    const addGoalTracker = useCallback(async (tracker: Omit<GoalTracker, "id" | "createdAt" | "completions">) => {
        const newTracker: GoalTracker = {
            ...tracker,
            id: generateId(),
            completions: [],
            createdAt: Date.now(),
        };
        const newStore = { ...store, goals: [...store.goals, newTracker] };
        await saveData(newStore);
    }, [store]);

    const updateGoalTracker = useCallback(async (id: string, updates: Partial<GoalTracker>) => {
        const newStore = {
            ...store,
            goals: store.goals.map(g => g.id === id ? { ...g, ...updates } : g),
        };
        await saveData(newStore);
    }, [store]);

    const deleteGoalTracker = useCallback(async (id: string) => {
        const newStore = { ...store, goals: store.goals.filter(g => g.id !== id) };
        await saveData(newStore);
    }, [store]);

    const incrementGoal = useCallback(async (trackerId: string) => {
        const tracker = store.goals.find(g => g.id === trackerId);
        if (!tracker) return;

        const periodStart = getPeriodStart(tracker.period, tracker.startDay, tracker.startDate);
        const existingRecord = tracker.completions.find(c => c.periodStart === periodStart);

        // Don't increment if already at frequency limit
        if (existingRecord && existingRecord.count >= tracker.frequency) return;

        let newCompletions: CompletionRecord[];
        if (existingRecord) {
            newCompletions = tracker.completions.map(c =>
                c.periodStart === periodStart ? { ...c, count: c.count + 1 } : c
            );
        } else {
            newCompletions = [...tracker.completions, { periodStart, count: 1 }];
        }

        const newStore = {
            ...store,
            goals: store.goals.map(g =>
                g.id === trackerId ? { ...g, completions: newCompletions } : g
            ),
        };
        await saveData(newStore);
    }, [store]);

    const decrementGoal = useCallback(async (trackerId: string) => {
        const tracker = store.goals.find(g => g.id === trackerId);
        if (!tracker) return;

        const periodStart = getPeriodStart(tracker.period, tracker.startDay, tracker.startDate);
        const existingRecord = tracker.completions.find(c => c.periodStart === periodStart);

        // Can't decrement if count is 0 or no record exists
        if (!existingRecord || existingRecord.count <= 0) return;

        const newCompletions = tracker.completions.map(c =>
            c.periodStart === periodStart ? { ...c, count: c.count - 1 } : c
        );

        const newStore = {
            ...store,
            goals: store.goals.map(g =>
                g.id === trackerId ? { ...g, completions: newCompletions } : g
            ),
        };
        await saveData(newStore);
    }, [store]);

    const getCurrentPeriodProgress = useCallback((trackerId: string) => {
        const tracker = store.goals.find(g => g.id === trackerId);
        if (!tracker) return { count: 0, frequency: 0, periodStart: 0 };

        const periodStart = getPeriodStart(tracker.period, tracker.startDay, tracker.startDate);
        const record = tracker.completions.find(c => c.periodStart === periodStart);

        return {
            count: record?.count || 0,
            frequency: tracker.frequency,
            periodStart,
        };
    }, [store]);

    const getGoalHistory = useCallback((trackerId: string, limit: number = 8) => {
        const tracker = store.goals.find(g => g.id === trackerId);
        if (!tracker) return [];

        // Sort by periodStart descending and take limit
        return [...tracker.completions]
            .sort((a, b) => b.periodStart - a.periodStart)
            .slice(0, limit)
            .reverse();
    }, [store]);

    const getStatsByTag = useCallback(() => {
        const tagMap = new Map<string, TagStats>();

        for (const goal of store.goals) {
            const existing = tagMap.get(goal.tag);
            const periodStart = getPeriodStart(goal.period, goal.startDay, goal.startDate);
            const currentRecord = goal.completions.find(c => c.periodStart === periodStart);
            const completedPeriods = goal.completions.filter(c => c.count >= goal.frequency).length;

            if (existing) {
                existing.totalGoals += 1;
                existing.completedPeriods += completedPeriods;
                existing.totalPeriods += goal.completions.length;
                existing.currentProgress += currentRecord?.count || 0;
                existing.currentTarget += goal.frequency;
            } else {
                tagMap.set(goal.tag, {
                    tag: goal.tag,
                    tagColor: goal.tagColor,
                    totalGoals: 1,
                    completedPeriods,
                    totalPeriods: goal.completions.length,
                    currentProgress: currentRecord?.count || 0,
                    currentTarget: goal.frequency,
                });
            }
        }

        return Array.from(tagMap.values());
    }, [store]);

    // Measurement Actions
    const addMeasurementTracker = useCallback(async (tracker: Omit<MeasurementTracker, "id" | "createdAt" | "entries">) => {
        const newTracker: MeasurementTracker = {
            ...tracker,
            id: generateId(),
            entries: [],
            createdAt: Date.now(),
        };
        const newStore = { ...store, measurements: [...store.measurements, newTracker] };
        await saveData(newStore);
    }, [store]);

    const addMeasurementEntry = useCallback(async (trackerId: string, value: number) => {
        const newEntry: MeasurementEntry = {
            id: generateId(),
            value,
            date: Date.now(),
        };
        const newStore = {
            ...store,
            measurements: store.measurements.map(m => {
                if (m.id === trackerId) {
                    return { ...m, entries: [...m.entries, newEntry] };
                }
                return m;
            }),
        };
        await saveData(newStore);
    }, [store]);

    const deleteMeasurementTracker = useCallback(async (id: string) => {
        const newStore = { ...store, measurements: store.measurements.filter(m => m.id !== id) };
        await saveData(newStore);
    }, [store]);

    // Getters
    const getGoalTracker = useCallback((id: string) => store.goals.find(g => g.id === id), [store]);
    const getMeasurementTracker = useCallback((id: string) => store.measurements.find(m => m.id === id), [store]);

    return (
        <TrackerContext.Provider
            value={{
                store,
                loading,
                addGoalTracker,
                updateGoalTracker,
                deleteGoalTracker,
                incrementGoal,
                decrementGoal,
                getCurrentPeriodProgress,
                getGoalHistory,
                getStatsByTag,
                addMeasurementTracker,
                addMeasurementEntry,
                deleteMeasurementTracker,
                getGoalTracker,
                getMeasurementTracker,
            }}
        >
            {children}
        </TrackerContext.Provider>
    );
}

export function useTrackers() {
    const context = useContext(TrackerContext);
    if (!context) {
        throw new Error("useTrackers must be used within a TrackerProvider");
    }
    return context;
}
