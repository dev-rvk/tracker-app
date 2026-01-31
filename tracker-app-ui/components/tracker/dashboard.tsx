"use client"

import { useState } from "react"
import { Plus, Target, TrendingUp, ChevronRight, Settings, Moon, Sun, X } from "lucide-react"
import type { View } from "@/app/page"

interface DashboardProps {
  onNavigate: (view: View, trackerId?: string) => void
}

// Mock data for trackers
const goalTrackers = [
  {
    id: "goal-1",
    name: "Daily Steps",
    tag: "Health",
    tagColor: "bg-tag-health",
    frequency: "daily",
    completedCount: 5,
    totalCount: 7,
    tasks: [
      { name: "Complete 5000 steps", completed: true },
      { name: "Walk for 30 minutes", completed: false },
    ],
  },
  {
    id: "goal-2",
    name: "DSA Practice",
    tag: "Academic",
    tagColor: "bg-tag-academic",
    frequency: "weekly",
    completedCount: 2,
    totalCount: 3,
    tasks: [
      { name: "Solve 3 LeetCode problems", completed: true },
      { name: "Review algorithms", completed: true },
      { name: "Practice dynamic programming", completed: false },
    ],
  },
  {
    id: "goal-3",
    name: "Gym Sessions",
    tag: "Fitness",
    tagColor: "bg-tag-fitness",
    frequency: "weekly",
    completedCount: 2,
    totalCount: 3,
    tasks: [
      { name: "Go to gym 3 times", completed: true },
      { name: "Complete cardio session", completed: true },
      { name: "Do strength training", completed: false },
    ],
  },
]

const measurementTrackers = [
  {
    id: "measure-1",
    name: "Weight",
    unit: "kg",
    currentValue: 72.5,
    previousValue: 73.2,
    trend: "down",
    lastUpdated: "Today",
  },
  {
    id: "measure-2",
    name: "Waist",
    unit: "cm",
    currentValue: 82,
    previousValue: 83,
    trend: "down",
    lastUpdated: "Yesterday",
  },
]

type TabType = "goals" | "measurements"

export function Dashboard({ onNavigate }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("goals")
  const [showSettings, setShowSettings] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="px-4 pb-24 pt-12">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Trackr</h1>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 glass-button rounded-full flex items-center justify-center"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <span className="text-muted-foreground text-xs font-medium">Goals</span>
          </div>
          <p className="text-foreground text-2xl font-bold">9/13</p>
          <p className="text-muted-foreground text-xs">Tasks completed</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <span className="text-muted-foreground text-xs font-medium">Measurements</span>
          </div>
          <p className="text-foreground text-2xl font-bold">2</p>
          <p className="text-muted-foreground text-xs">Active trackers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-2xl p-1 mb-6">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab("goals")}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "goals"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            <Target className="w-4 h-4" />
            Goals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("measurements")}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "measurements"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Measurements
          </button>
        </div>
      </div>

      {/* Goal Trackers Tab */}
      {activeTab === "goals" && (
        <section>
          <div className="space-y-3">
            {goalTrackers.map((tracker) => (
              <button
                key={tracker.id}
                type="button"
                onClick={() => onNavigate("goal-detail", tracker.id)}
                className="w-full glass-card rounded-2xl p-4 text-left transition-all hover:shadow-lg active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-foreground font-semibold">{tracker.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tracker.tagColor} text-primary-foreground`}>
                        {tracker.tag}
                      </span>
                      <span className="text-muted-foreground text-xs capitalize">
                        {tracker.frequency}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">
                      {tracker.completedCount}/{tracker.totalCount}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${tracker.tagColor} rounded-full transition-all`}
                      style={{ width: `${(tracker.completedCount / tracker.totalCount) * 100}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Measurement Trackers Tab */}
      {activeTab === "measurements" && (
        <section>
          <div className="space-y-3">
            {measurementTrackers.map((tracker) => (
              <button
                key={tracker.id}
                type="button"
                onClick={() => onNavigate("measurement-detail", tracker.id)}
                className="w-full glass-card rounded-2xl p-4 text-left transition-all hover:shadow-lg active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground font-semibold">{tracker.name}</h3>
                    <p className="text-muted-foreground text-xs mt-1">
                      Updated {tracker.lastUpdated}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-foreground text-xl font-bold">
                        {tracker.currentValue}
                        <span className="text-muted-foreground text-sm font-normal ml-1">
                          {tracker.unit}
                        </span>
                      </p>
                      <p className={`text-xs font-medium ${
                        tracker.trend === "down" ? "text-accent" : "text-destructive"
                      }`}>
                        {tracker.trend === "down" ? "↓" : "↑"} {Math.abs(tracker.currentValue - tracker.previousValue).toFixed(1)} {tracker.unit}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Floating Add Button */}
      <button
        type="button"
        onClick={() => onNavigate("add-tracker")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground transition-all hover:scale-105 active:scale-95"
        aria-label="Add new tracker"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="w-full max-w-md glass-heavy rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-foreground text-xl font-bold">Settings</h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                aria-label="Close settings"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <p className="text-foreground font-medium">Appearance</p>
                    <p className="text-muted-foreground text-sm">
                      {isDarkMode ? "Dark mode" : "Light mode"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className={`w-14 h-8 rounded-full transition-all relative ${
                    isDarkMode ? "bg-primary" : "bg-muted"
                  }`}
                  aria-label="Toggle dark mode"
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                      isDarkMode ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 py-4 rounded-2xl font-semibold bg-primary text-primary-foreground"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
