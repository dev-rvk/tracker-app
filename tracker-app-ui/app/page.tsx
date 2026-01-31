"use client"

import { useState } from "react"
import { Dashboard } from "@/components/tracker/dashboard"
import { AddTracker } from "@/components/tracker/add-tracker"
import { GoalTrackerDetail } from "@/components/tracker/goal-tracker-detail"
import { MeasurementTrackerDetail } from "@/components/tracker/measurement-tracker-detail"

export type View = "dashboard" | "add-tracker" | "goal-detail" | "measurement-detail"

export default function TrackerApp() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [selectedTracker, setSelectedTracker] = useState<string | null>(null)

  const navigate = (view: View, trackerId?: string) => {
    setCurrentView(view)
    if (trackerId) setSelectedTracker(trackerId)
  }

  return (
    <div className="min-h-screen ios-gradient">
      <div className="mx-auto max-w-md min-h-screen">
        {currentView === "dashboard" && (
          <Dashboard onNavigate={navigate} />
        )}
        {currentView === "add-tracker" && (
          <AddTracker onNavigate={navigate} />
        )}
        {currentView === "goal-detail" && (
          <GoalTrackerDetail onNavigate={navigate} trackerId={selectedTracker} />
        )}
        {currentView === "measurement-detail" && (
          <MeasurementTrackerDetail onNavigate={navigate} trackerId={selectedTracker} />
        )}
      </div>
    </div>
  )
}
