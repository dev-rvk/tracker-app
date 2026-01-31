import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { GoalTracker, MeasurementEntry, MeasurementTracker, TrackerStore } from "../types/tracker";

const STORAGE_KEY = "tracker_data";

// Sample data to start with
const initialData: TrackerStore = {
    goals: [
        {
            id: "goal-1",
            name: "Daily Steps",
            tag: "Health",
            tagColor: "bg-tag-health",
            frequency: "daily",
            tasks: [
                { id: "t1", name: "Complete 5000 steps", completed: true },
                { id: "t2", name: "Walk for 30 minutes", completed: false },
                { id: "t3", name: "Take stairs", completed: true },
            ],
            createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        },
        {
            id: "goal-2",
            name: "DSA Practice",
            tag: "Academic",
            tagColor: "bg-tag-academic",
            frequency: "weekly",
            tasks: [
                { id: "t4", name: "Solve 3 LeetCode problems", completed: true },
                { id: "t5", name: "Review algorithms", completed: true },
                { id: "t6", name: "Practice dynamic programming", completed: false },
            ],
            startDay: "Mon",
            createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
        },
        {
            id: "goal-3",
            name: "Gym Sessions",
            tag: "Fitness",
            tagColor: "bg-tag-fitness",
            frequency: "weekly",
            tasks: [
                { id: "t7", name: "Go to gym 3 times", completed: true },
                { id: "t8", name: "Complete cardio session", completed: true },
                { id: "t9", name: "Do strength training", completed: false },
            ],
            startDay: "Mon",
            createdAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
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

interface TrackerContextType {
    store: TrackerStore;
    loading: boolean;
    // Goal actions
    addGoalTracker: (tracker: Omit<GoalTracker, "id" | "createdAt">) => Promise<void>;
    updateGoalTracker: (id: string, updates: Partial<GoalTracker>) => Promise<void>;
    deleteGoalTracker: (id: string) => Promise<void>;
    toggleTask: (trackerId: string, taskId: string) => Promise<void>;
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
    const addGoalTracker = useCallback(async (tracker: Omit<GoalTracker, "id" | "createdAt">) => {
        const newTracker: GoalTracker = {
            ...tracker,
            id: generateId(),
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

    const toggleTask = useCallback(async (trackerId: string, taskId: string) => {
        const newStore = {
            ...store,
            goals: store.goals.map(g => {
                if (g.id === trackerId) {
                    return {
                        ...g,
                        tasks: g.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
                    };
                }
                return g;
            }),
        };
        await saveData(newStore);
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
                toggleTask,
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
