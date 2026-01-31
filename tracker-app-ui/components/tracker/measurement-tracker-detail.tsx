"use client"

import { useState } from "react"
import { ArrowLeft, Plus, TrendingDown, TrendingUp } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import type { View } from "@/app/page"

interface MeasurementTrackerDetailProps {
  onNavigate: (view: View) => void
  trackerId: string | null
}

// Mock data
const trackerInfo = {
  id: "measure-1",
  name: "Weight",
  unit: "kg",
  currentValue: 72.5,
  startValue: 75.0,
  lowestValue: 72.0,
  highestValue: 76.2,
}

const weeklyData = [
  { label: "Mon", value: 73.2 },
  { label: "Tue", value: 73.0 },
  { label: "Wed", value: 72.8 },
  { label: "Thu", value: 72.9 },
  { label: "Fri", value: 72.6 },
  { label: "Sat", value: 72.5 },
  { label: "Sun", value: 72.5 },
]

const monthlyData = [
  { label: "Jan 1", value: 75.0 },
  { label: "Jan 8", value: 74.5 },
  { label: "Jan 15", value: 74.2 },
  { label: "Jan 22", value: 73.5 },
  { label: "Jan 29", value: 72.5 },
]

const threeMonthData = [
  { label: "Nov 1", value: 76.0 },
  { label: "Nov 15", value: 75.8 },
  { label: "Dec 1", value: 75.2 },
  { label: "Dec 15", value: 74.5 },
  { label: "Jan 1", value: 73.8 },
  { label: "Jan 15", value: 73.0 },
  { label: "Jan 30", value: 72.5 },
]

const allTimeData = [
  { label: "Sep", value: 77.5 },
  { label: "Oct", value: 76.8 },
  { label: "Nov", value: 76.0 },
  { label: "Dec", value: 75.2 },
  { label: "Jan", value: 72.5 },
]

type TimeRange = "week" | "month" | "3months" | "all"

const timeRanges = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "3months", label: "3 Months" },
  { value: "all", label: "All Time" },
]

export function MeasurementTrackerDetail({ onNavigate, trackerId }: MeasurementTrackerDetailProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("week")
  const [newValue, setNewValue] = useState("")

  const getChartData = () => {
    switch (selectedRange) {
      case "week":
        return weeklyData
      case "month":
        return monthlyData
      case "3months":
        return threeMonthData
      case "all":
        return allTimeData
      default:
        return weeklyData
    }
  }

  const chartData = getChartData()
  
  const totalChange = trackerInfo.currentValue - trackerInfo.startValue
  const percentChange = ((totalChange / trackerInfo.startValue) * 100).toFixed(1)
  const isPositiveTrend = totalChange < 0 // For weight, losing is positive

  const handleAddEntry = () => {
    if (newValue.trim()) {
      // In a real app, this would save to database
      setNewValue("")
    }
  }

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
          <h1 className="text-foreground text-2xl font-bold">{trackerInfo.name}</h1>
          <p className="text-muted-foreground text-sm">
            Tracking in {trackerInfo.unit}
          </p>
        </div>
      </header>

      {/* Quick Add Entry - First */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <h3 className="text-foreground font-semibold mb-3">Add Entry</h3>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`Enter ${trackerInfo.unit}...`}
            className="flex-1 bg-input rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="button"
            onClick={handleAddEntry}
            className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            aria-label="Add entry"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Current Value Card */}
      <div className="glass-card rounded-3xl p-6 mb-6">
        <h3 className="text-foreground font-semibold mb-4">Current Progress</h3>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm mb-1">Current</p>
            <p className="text-foreground text-4xl font-bold">
              {trackerInfo.currentValue}
              <span className="text-muted-foreground text-lg font-normal ml-1">
                {trackerInfo.unit}
              </span>
            </p>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
            isPositiveTrend ? "bg-accent/10" : "bg-destructive/10"
          }`}>
            {isPositiveTrend ? (
              <TrendingDown className="w-4 h-4 text-accent" />
            ) : (
              <TrendingUp className="w-4 h-4 text-destructive" />
            )}
            <span className={`text-sm font-medium ${
              isPositiveTrend ? "text-accent" : "text-destructive"
            }`}>
              {Math.abs(totalChange).toFixed(1)} {trackerInfo.unit} ({percentChange}%)
            </span>
          </div>
        </div>
        
        {/* Mini Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div>
            <p className="text-muted-foreground text-xs">Start</p>
            <p className="text-foreground font-semibold">{trackerInfo.startValue} {trackerInfo.unit}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Lowest</p>
            <p className="text-accent font-semibold">{trackerInfo.lowestValue} {trackerInfo.unit}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Highest</p>
            <p className="text-foreground font-semibold">{trackerInfo.highestValue} {trackerInfo.unit}</p>
          </div>
        </div>
      </div>

      {/* Overall Progress - Chart Section */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-foreground font-semibold mb-4">Overall Progress</h3>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-4">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => setSelectedRange(range.value as TimeRange)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedRange === range.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.15 250)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="oklch(0.55 0.15 250)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 250 / 0.3)" vertical={false} />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11, fill: "oklch(0.45 0.02 250)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fontSize: 11, fill: "oklch(0.45 0.02 250)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{
                  background: "oklch(1 0 0 / 0.9)",
                  border: "1px solid oklch(0.88 0.01 250 / 0.5)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px oklch(0 0 0 / 0.1)",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "oklch(0.15 0.01 250)", fontWeight: 500 }}
                formatter={(value: number) => [`${value} ${trackerInfo.unit}`, "Value"]}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="oklch(0.55 0.15 250)" 
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Period Summary */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {selectedRange === "week" ? "7 days" : 
               selectedRange === "month" ? "30 days" :
               selectedRange === "3months" ? "90 days" : "All time"}
            </span>
            <span className="text-foreground font-medium">
              {chartData.length} entries
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
