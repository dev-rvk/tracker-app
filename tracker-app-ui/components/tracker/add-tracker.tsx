"use client"

import { useState } from "react"
import { ArrowLeft, Target, TrendingUp, Check, Plus, X } from "lucide-react"
import type { View } from "@/app/page"

interface AddTrackerProps {
  onNavigate: (view: View) => void
}

type TrackerType = "goal" | "measurement" | null
type Frequency = "daily" | "weekly" | "monthly"
type Unit = "kg" | "cm" | "lbs" | "custom"

const predefinedTags = [
  { name: "Health", color: "bg-tag-health" },
  { name: "Academic", color: "bg-tag-academic" },
  { name: "Fitness", color: "bg-tag-fitness" },
  { name: "Work", color: "bg-tag-work" },
]

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function AddTracker({ onNavigate }: AddTrackerProps) {
  const [selectedType, setSelectedType] = useState<TrackerType>(null)
  
  // Goal tracker state
  const [goalName, setGoalName] = useState("")
  const [selectedFrequency, setSelectedFrequency] = useState<Frequency>("daily")
  const [selectedTag, setSelectedTag] = useState(predefinedTags[0])
  const [tasks, setTasks] = useState<string[]>([])
  const [newTask, setNewTask] = useState("")
  const [customTags, setCustomTags] = useState<{ name: string; color: string }[]>([])
  const [showAddTag, setShowAddTag] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [startDay, setStartDay] = useState("Monday")
  const [startDate, setStartDate] = useState(1)
  
  // Measurement tracker state
  const [measurementName, setMeasurementName] = useState("")
  const [selectedUnit, setSelectedUnit] = useState<Unit>("kg")
  const [customUnit, setCustomUnit] = useState("")

  const allTags = [...predefinedTags, ...customTags]

  const handleTypeSelect = (type: TrackerType) => {
    setSelectedType(type)
  }

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()])
      setNewTask("")
    }
  }

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const handleAddCustomTag = () => {
    if (newTagName.trim()) {
      const newTag = { 
        name: newTagName.trim(), 
        color: "bg-primary" 
      }
      setCustomTags([...customTags, newTag])
      setSelectedTag(newTag)
      setNewTagName("")
      setShowAddTag(false)
    }
  }

  const handleBack = () => {
    if (selectedType) {
      setSelectedType(null)
    } else {
      onNavigate("dashboard")
    }
  }

  return (
    <div className="min-h-screen px-4 pb-8 pt-12">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 glass-button rounded-full flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-foreground text-2xl font-bold">Add Tracker</h1>
          <p className="text-muted-foreground text-sm">
            {!selectedType ? "Choose tracker type" : "Configure your tracker"}
          </p>
        </div>
      </header>

      {/* Select Type */}
      {!selectedType && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => handleTypeSelect("goal")}
            className="w-full glass-card rounded-2xl p-6 text-left transition-all hover:shadow-lg active:scale-[0.98]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground text-lg font-semibold">Goal Tracker</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Track tasks and habits with daily, weekly, or monthly goals. Perfect for step counts, gym visits, study sessions, and more.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
                    Checkboxes
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
                    Tags
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
                    Progress Bars
                  </span>
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect("measurement")}
            className="w-full glass-card rounded-2xl p-6 text-left transition-all hover:shadow-lg active:scale-[0.98]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground text-lg font-semibold">Measurement Tracker</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Track physical quantities over time. Ideal for weight, body measurements, or any numeric value you want to monitor.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
                    Charts
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
                    Trends
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
                    Custom Units
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Configure Goal Tracker */}
      {selectedType === "goal" && (
        <div className="space-y-6">
          {/* Tracker Name */}
          <div className="glass-card rounded-2xl p-4">
            <label htmlFor="goal-name" className="text-foreground text-sm font-medium block mb-2">
              Tracker Name
            </label>
            <input
              id="goal-name"
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="e.g., Daily Steps, Weekly Gym"
              className="w-full bg-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Frequency */}
          <div className="glass-card rounded-2xl p-4">
            <label className="text-foreground text-sm font-medium block mb-3">
              Frequency
            </label>
            <div className="flex gap-2">
              {(["daily", "weekly", "monthly"] as Frequency[]).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setSelectedFrequency(freq)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedFrequency === freq
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Start Day/Date Selection based on Frequency */}
          {selectedFrequency === "weekly" && (
            <div className="glass-card rounded-2xl p-4">
              <label className="text-foreground text-sm font-medium block mb-3">
                Week Starts On
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setStartDay(day)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      startDay === day
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedFrequency === "monthly" && (
            <div className="glass-card rounded-2xl p-4">
              <label className="text-foreground text-sm font-medium block mb-3">
                Month Starts On Day
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 5, 10, 15, 20, 25].map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setStartDate(date)}
                    className={`w-12 h-10 rounded-xl text-sm font-medium transition-all ${
                      startDate === date
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground text-xs mt-2">
                Your monthly tracking period will start on day {startDate} of each month
              </p>
            </div>
          )}

          {/* Tag Selection */}
          <div className="glass-card rounded-2xl p-4">
            <label className="text-foreground text-sm font-medium block mb-3">
              Tag
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {allTags.map((tag) => (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedTag.name === tag.name
                      ? `${tag.color} text-primary-foreground`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {selectedTag.name === tag.name && <Check className="w-4 h-4" />}
                  {tag.name}
                </button>
              ))}
            </div>
            
            {/* Add Custom Tag */}
            {showAddTag ? (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomTag()}
                  placeholder="Tag name..."
                  className="flex-1 bg-input rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-4 py-2 bg-primary rounded-xl text-primary-foreground text-sm font-medium"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTag(false)
                    setNewTagName("")
                  }}
                  className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center"
                  aria-label="Cancel"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddTag(true)}
                className="flex items-center gap-2 text-primary text-sm font-medium mt-2"
              >
                <Plus className="w-4 h-4" />
                Add Custom Tag
              </button>
            )}
          </div>

          {/* Tasks */}
          <div className="glass-card rounded-2xl p-4">
            <label className="text-foreground text-sm font-medium block mb-3">
              Tasks
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                placeholder="Add a task..."
                className="flex-1 bg-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground"
                aria-label="Add task"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div
                  key={`${task}-${index}`}
                  className="flex items-center justify-between bg-muted rounded-xl px-4 py-3"
                >
                  <span className="text-foreground text-sm">{task}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(index)}
                    className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center"
                    aria-label="Remove task"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No tasks added yet
                </p>
              )}
            </div>
          </div>

          {/* Create Button */}
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Create Goal Tracker
          </button>
        </div>
      )}

      {/* Configure Measurement Tracker */}
      {selectedType === "measurement" && (
        <div className="space-y-6">
          {/* Tracker Name */}
          <div className="glass-card rounded-2xl p-4">
            <label htmlFor="measurement-name" className="text-foreground text-sm font-medium block mb-2">
              What do you want to track?
            </label>
            <input
              id="measurement-name"
              type="text"
              value={measurementName}
              onChange={(e) => setMeasurementName(e.target.value)}
              placeholder="e.g., Weight, Waist, Blood Pressure"
              className="w-full bg-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Unit Selection */}
          <div className="glass-card rounded-2xl p-4">
            <label className="text-foreground text-sm font-medium block mb-3">
              Unit of Measurement
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "kg", label: "Kilograms (kg)" },
                { value: "lbs", label: "Pounds (lbs)" },
                { value: "cm", label: "Centimeters (cm)" },
                { value: "custom", label: "Custom Unit" },
              ].map((unit) => (
                <button
                  key={unit.value}
                  type="button"
                  onClick={() => setSelectedUnit(unit.value as Unit)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all text-left ${
                    selectedUnit === unit.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {unit.label}
                </button>
              ))}
            </div>
            
            {selectedUnit === "custom" && (
              <input
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="Enter custom unit..."
                className="w-full mt-3 bg-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            )}
          </div>

          {/* Info Card */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h4 className="text-foreground text-sm font-medium">How it works</h4>
                <p className="text-muted-foreground text-sm mt-1">
                  Enter your measurements whenever you want. View your progress as a beautiful graph showing trends over days, weeks, or months.
                </p>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Create Measurement Tracker
          </button>
        </div>
      )}
    </div>
  )
}
