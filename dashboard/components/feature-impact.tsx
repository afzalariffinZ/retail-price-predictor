"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

interface FeatureImpactData {
  name: string
  value: number
}

export function FeatureImpact({ data = [] }: { data?: FeatureImpactData[] }) {
  // Default data if backend hasn't responded yet
  const defaultData = [
    { name: "USD Rate (60d)", value: 85 },
    { name: "Diesel Price", value: 45 },
    { name: "Festive Season", value: 20 },
    { name: "Supply Policy", value: -15.5 },
  ]

  const chartData = (data.length > 0 ? data : defaultData).map(item => ({
    name: item.name,
    impact: item.value,
    fill: item.value >= 0 ? "#ef4444" : "#3b82f6" // Red for positive, Blue for negative
  }))

  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-1">
      <CardHeader>
        <CardTitle>Feature Impact (Live SHAP)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={chartData} margin={{ left: 40 }}>
            <XAxis type="number" hide />
            <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                tick={{ fontSize: 12 }} 
                interval={0}
            />
            <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
