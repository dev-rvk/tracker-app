"use client"

import { useState } from "react"
import { ArrowLeft, Check, BarChart3, Calendar, ChevronDown } from "lucide-react"
import type { View } from "@/app/page"

interface GoalTrackerDetailProps {
  onNavigate: (view: View) => void
  trackerId: string | null
}

// Mock data
const trackerData = {
  id: "goal-1",
  name: "Daily Steps",
  tag: "Health",
  tagColor: "bg-tag-health",
  frequency: "daily",
  tasks: [
    { id: "t1", name: "Complete 5000 steps", completed: true },
    { id: "t2", name: "Walk for 30 minutes", completed: false },
    { id: "t3", name: "Take stairs instead of elevator", completed: true },
  ],
}

const monthlyData = [
  { week: "Week 1", completed: 6, total: 7 },
  { week: "Week 2", completed: 5, total: 7 },
  { week: "Week 3", completed: 7, total: 7 },
  { week: "Week 4", completed: 4, total: 7 },
]

const tagProgress = [
  { tag: "Health", color: "bg-tag-health", completed: 22, total: 28, percentage: 79 },
  { tag: "Academic", color: "bg-tag-academic", completed: 8, total: 12, percentage: 67 },
  { tag: "Fitness", color: "bg-tag-fitness", completed: 6, total: 9, percentage: 67 },
]

export function GoalTrackerDetail({ onNavigate, trackerId }: GoalTrackerDetailProps) {
  const [tasks, setTasks] = useState(trackerData.tasks)
  const [viewMode, setViewMode] = useState<"current" | "overall">("current")
  const [selectedPeriod, setSelectedPeriod] = useState("This Week")

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const percentage = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="min-h-screen px-4 pb-8 pt-12">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className="w-10 h-10 glass-button rounded-full flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-foreground text-2xl font-bold">{trackerData.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${trackerData.tagColor} text-primary-foreground`}>
              {trackerData.tag}
            </span>
            <span className="text-muted-foreground text-xs capitalize">
              {trackerData.frequency}
            </span>
          </div>
        </div>
      </header>

      {/* View Toggle */}
      <div className="glass-card rounded-2xl p-1 mb-6">
        <div className="flex">
          <button
            type="button"
            onClick={() => setViewMode("current")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === "current"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            Current Period
          </button>
          <button
            type="button"
            onClick={() => setViewMode("overall")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              viewMode === "overall"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            Overall Stats
          </button>
        </div>
      </div>

      {viewMode === "current" ? (
        <>
          {/* Tasks List - First */}
          <div className="glass-card rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-semibold">Tasks</h3>
              <button
                type="button"
                className="flex items-center gap-1 text-primary text-sm font-medium"
              >
                <Calendar className="w-4 h-4" />
                {selectedPeriod}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 transition-all hover:bg-muted text-left"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed 
                      ? `${trackerData.tagColor} border-transparent` 
                      : "border-muted-foreground"
                  }`}>
                    {task.completed && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>
                  <span className={`flex-1 text-sm ${
                    task.completed ? "text-muted-foreground line-through" : "text-foreground"
                  }`}>
                    {task.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Progress - Below Tasks */}
          <div className="glass-card rounded-3xl p-6 mb-6">
            <h3 className="text-foreground font-semibold mb-4">Current Progress</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    strokeWidth="8"
                    className="fill-none stroke-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className={`fill-none stroke-tag-health transition-all duration-500`}
                    style={{
                      strokeDasharray: `${2 * Math.PI * 40}`,
                      strokeDashoffset: `${2 * Math.PI * 40 * (1 - percentage / 100)}`,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-foreground text-xl font-bold">{percentage}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-foreground text-lg font-semibold">
                  {completedCount} of {totalCount} tasks
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {selectedPeriod}
                </p>
                {completedCount === totalCount ? (
                  <p className="text-accent text-sm font-medium mt-2">
                    All tasks completed!
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm mt-2">
                    {totalCount - completedCount} remaining
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mark All Complete Button */}
          <button
            type="button"
            className="w-full glass-button py-4 rounded-2xl font-semibold text-foreground transition-all hover:bg-glass-heavy"
          >
            Mark All as Complete
          </button>
        </>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="glass-card rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-semibold">Monthly Overview</h3>
              <button
                type="button"
                className="flex items-center gap-1 text-primary text-sm font-medium"
              >
                January 2026
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            {/* Bar Chart */}
            <div className="space-y-3">
              {monthlyData.map((week) => (
                <div key={week.week} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{week.week}</span>
                    <span className="text-foreground font-medium">
                      {week.completed}/{week.total}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${trackerData.tagColor} rounded-full transition-all`}
                      style={{ width: `${(week.completed / week.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tag-based Progress */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-foreground font-semibold">Progress by Tag</h3>
            </div>
            <div className="space-y-4">
              {tagProgress.map((tag) => (
                <div key={tag.tag} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${tag.color}`} />
                      <span className="text-foreground text-sm font-medium">{tag.tag}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {tag.completed}/{tag.total} ({tag.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${tag.color} rounded-full transition-all`}
                      style={{ width: `${tag.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
