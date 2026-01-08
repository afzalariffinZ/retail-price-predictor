"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, TooltipProps } from "recharts"

interface DataPoint {
  date: string
  price: number
}

type TimeRange = "30d" | "6m" | "1y" | "all";

// Custom Tooltip Component to show date and price
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-1">
          Date: {data.fullDate || data.date}
        </p>
        {payload.map((entry, index) => (
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
  // Default data if backend hasn't responded yet
  const defaultData = [
    { date: "02-05", fullDate: "2024-02-05", actual: 4.50, predicted: null },
    { date: "02-12", fullDate: "2024-02-12", actual: 4.55, predicted: null },
    { date: "02-19", fullDate: "2024-02-19", actual: 4.52, predicted: null },
    { date: "02-26", fullDate: "2024-02-26", actual: 4.60, predicted: null },
    { date: "03-05", fullDate: "2024-03-05", actual: 4.65, predicted: null },
    { date: "03-12", fullDate: "2024-03-12", actual: 4.70, predicted: null },
    { date: "03-19", fullDate: "2024-03-19", actual: 4.68, predicted: null },
    { date: "03-26", fullDate: "2024-03-26", actual: 4.72, predicted: null },
    { date: "04-02", fullDate: "2024-04-02", actual: 4.75, predicted: null },
    { date: "04-09", fullDate: "2024-04-09", actual: 4.80, predicted: null },
    { date: "04-16", fullDate: "2024-04-16", actual: 4.78, predicted: null },
    { date: "04-23", fullDate: "2024-04-23", actual: 4.82, predicted: null },
    { date: "04-30", fullDate: "2024-04-30", actual: 4.85, predicted: null },
    { date: "05-07", fullDate: "2024-05-07", actual: 4.40, predicted: null },
    { date: "05-14", fullDate: "2024-05-14", actual: 4.35, predicted: null },
    { date: "05-21", fullDate: "2024-05-21", actual: 4.30, predicted: null },
    { date: "05-28", fullDate: "2024-05-28", actual: 4.45, predicted: null },
    { date: "06-04", fullDate: "2024-06-04", actual: 4.50, predicted: null },
    { date: "06-11", fullDate: "2024-06-11", actual: 4.55, predicted: null },
    { date: "06-18", fullDate: "2024-06-18", actual: 4.60, predicted: null },
    { date: "06-25", fullDate: "2024-06-25", actual: 4.65, predicted: null },
    { date: "07-02", fullDate: "2024-07-02", actual: 4.70, predicted: null },
    { date: "07-09", fullDate: "2024-07-09", actual: 4.75, predicted: null },
    { date: "07-16", fullDate: "2024-07-16", actual: 4.80, predicted: null },
    { date: "07-23", fullDate: "2024-07-23", actual: 4.90, predicted: null },
    { date: "07-30", fullDate: "2024-07-30", actual: 5.00, predicted: null },
    { date: "08-06", fullDate: "2024-08-06", actual: 5.20, predicted: null },
    { date: "08-13", fullDate: "2024-08-13", actual: 5.35, predicted: null },
    { date: "08-20", fullDate: "2024-08-20", actual: 5.50, predicted: null },
    { date: "08-27", fullDate: "2024-08-27", actual: 5.55, predicted: null },
    { date: "09-03", fullDate: "2024-09-03", actual: null, predicted: 5.65 },
    { date: "09-10", fullDate: "2024-09-10", actual: null, predicted: 5.75 },
  ]

  // Combine history and future from backend
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
    : defaultData

  // Filter data based on time range
  const filterDataByTimeRange = (data: typeof allData) => {
    if (timeRange === "all") return data;
    
    const now = new Date();
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.fullDate);
      const diffDays = Math.abs(Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      switch (timeRange) {
        case "30d":
          return diffDays <= 30;
        case "6m":
          return diffDays <= 180;
        case "1y":
          return diffDays <= 365;
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
        <div className="flex items-center justify-between">
          <CardTitle>Historical Context & Future Projection</CardTitle>
          <div className="flex gap-2">
            {timeRangeButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setTimeRange(btn.value)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === btn.value
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="date" 
              stroke="#888888" 
              tickLine={false} 
              axisLine={false}
              tick={false}
              height={20}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `RM ${value}`} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              name="Historical Price" 
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#f97316" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              name="Future Projection" 
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
