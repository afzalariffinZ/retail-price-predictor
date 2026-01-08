"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface DataPoint {
  date: string
  price: number
}

type TimeRange = "30d" | "6m" | "1y" | "all";

// Custom Tooltip Component to show date and price
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-1">
          Date: {data.fullDate || data.date}
        </p>
        {payload.map((entry: any, index: number) => (
          entry.value !== null && (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: RM {entry.value?.toFixed(2)}
            </p>
          )
        ))}
      </div>
    );
  }
  return null;
};

export function HistoricalContext({ 
  history = [], 
  future = [] 
}: { 
  history?: DataPoint[]
  future?: DataPoint[]
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  
  // Combine history and future from backend - NO DEFAULT DATA
  // The backend now provides real dynamic projections
  const allData = history.length > 0 || future.length > 0 
    ? [
        ...history.map(h => ({ 
          date: h.date.substring(5), // "2024-01-05" -> "01-05"
          fullDate: h.date,
          actual: h.price, 
          predicted: null 
        })),
        ...future.map(f => ({ 
          date: f.date.substring(5), 
          fullDate: f.date,
          actual: null, 
          predicted: f.price 
        }))
      ]
    : []

  // Filter data based on time range (relative to the dataset, not current date)
  const filterDataByTimeRange = (data: typeof allData) => {
    if (timeRange === "all" || data.length === 0) return data;
    
    // Find the boundary between historical and future data
    const lastHistoricalIndex = data.findIndex(item => item.predicted !== null) - 1;
    const pivotDate = lastHistoricalIndex >= 0 ? new Date(data[lastHistoricalIndex].fullDate) : new Date(data[0]?.fullDate || new Date());
    
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.fullDate);
      const diffDays = Math.floor((itemDate.getTime() - pivotDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Include items based on range (both backwards and forwards from pivot)
      switch (timeRange) {
        case "30d":
          return diffDays >= -30 && diffDays <= 30;
        case "6m":
          return diffDays >= -180 && diffDays <= 30;
        case "1y":
          return diffDays >= -365 && diffDays <= 30;
        default:
          return true;
      }
    });
    return filteredData;
  };

  const chartData = filterDataByTimeRange(allData);

  const timeRangeButtons: { label: string; value: TimeRange }[] = [
    { label: "30d", value: "30d" },
    { label: "6m", value: "6m" },
    { label: "1y", value: "1y" },
    { label: "All", value: "all" },
  ];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg">Historical Context & 30-Day Sentinel Horizon</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Orange line: Dynamic causal projection based on 60-day cost lags</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {timeRangeButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setTimeRange(btn.value)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors font-medium ${
                  timeRange === btn.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[350px] sm:h-[400px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis 
                dataKey="date" 
                stroke="currentColor"
                className="text-muted-foreground"
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="currentColor"
                className="text-muted-foreground"
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `RM ${value}`} 
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3b82f6" 
                strokeWidth={2.5} 
                name="Historical Price" 
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#f97316" 
                strokeWidth={2.5} 
                strokeDasharray="5 5" 
                name="Causal Projection (30d)" 
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Execute analysis to view historical trends and future projections</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
