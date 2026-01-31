// Tracker data types

export interface Task {
    id: string;
    name: string;
    completed: boolean;
}

export interface GoalTracker {
    id: string;
    name: string;
    tag: string;
    tagColor: string;
    frequency: "daily" | "weekly" | "monthly";
    tasks: Task[];
    startDay?: string;  // For weekly trackers
    startDate?: number; // For monthly trackers
    createdAt: number;
}

export interface MeasurementEntry {
    id: string;
    value: number;
    date: number; // timestamp
}

export interface MeasurementTracker {
    id: string;
    name: string;
    unit: string;
    entries: MeasurementEntry[];
    createdAt: number;
}

export interface TrackerStore {
    goals: GoalTracker[];
    measurements: MeasurementTracker[];
}
