// Tracker data types

// Completion record for a specific period
export interface CompletionRecord {
    periodStart: number;  // Timestamp of period start
    count: number;        // How many times completed this period
}

export interface GoalTracker {
    id: string;
    name: string;                    // e.g., "Gym"
    tag: string;                     // e.g., "Health"
    tagColor: string;
    frequency: number;               // e.g., 3 (times per period)
    period: "daily" | "weekly" | "monthly";    // Reset period
    startDay: string;                // e.g., "Tue" for weekly
    startDate?: number;              // e.g., 1 for monthly
    completions: CompletionRecord[]; // History of completions
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
